import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/shared/BackButton'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { JobHeader } from '@/components/jobs/JobHeader'
import { JobSummary } from '@/components/jobs/JobSummary'
import { MatchScore } from '@/components/jobs/MatchScore'
import { CoverLetterPanel } from '@/components/jobs/CoverLetterPanel'
import { ApplicationChecklist } from '@/components/jobs/ApplicationChecklist'
import { OriginalListing } from '@/components/jobs/OriginalListing'
import { SummaryLimitNotice, UsageRemainingHint } from '@/components/jobs/UsageLimit'
import { getJobDetail } from '@/lib/jobs/arbeitsagentur-detail'
import { getOrCreateJobSummary } from '@/lib/jobs/jobSummaryCache'
import { consumeAiQuota, peekAiQuota } from '@/lib/quota'
import { createClient } from '@/lib/supabase/server'
import type { ApplicationStatus } from '@/types/application.types'
import type { JobSummary as JobSummaryData } from '@/types/ai.types'

interface JobDetailPageProps {
  params: Promise<{ refnr: string }>
  searchParams: Promise<{ titel?: string; arbeitgeber?: string; ort?: string }>
}

export async function generateMetadata({ searchParams }: JobDetailPageProps): Promise<Metadata> {
  const { titel, arbeitgeber } = await searchParams
  // Interne Stellen-ID gehört nicht in den Browser-Tab, stattdessen
  // "Jobtitel | Arbeitgeber" (das "| Fastcareer" hängt das Layout-Template an)
  if (!titel) return { title: 'Stellenangebot' }
  const parts = [titel.slice(0, 60), arbeitgeber?.slice(0, 40)].filter(Boolean)
  return { title: parts.join(' | ') }
}

export default async function JobDetailPage({ params, searchParams }: JobDetailPageProps) {
  const { refnr } = await params
  const { titel, arbeitgeber, ort } = await searchParams

  let detail
  try {
    detail = await getJobDetail(refnr)
  } catch {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [applicationResult, profileResult] = await Promise.all([
    user
      ? supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .eq('job_refnr', refnr)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const application = applicationResult.data
  const profile = profileResult.data

  // Fallback auf die gespeicherte Bewerbung: Links aus "Meine Bewerbungen"
  // tragen keine titel/arbeitgeber-Query-Params, ohne Fallback schlugen
  // dort Anschreiben- und Match-Generierung fehl ("Ungültige Job-Daten")
  const resolvedTitel = titel ?? application?.titel ?? 'Stellenangebot'
  const resolvedArbeitgeber = arbeitgeber ?? application?.arbeitgeber ?? ''
  const resolvedOrt = ort ?? application?.ort ?? ''

  // Kontingent-Kaskade: Pro (Admin) → 3 Gratis/Tag (angemeldet per User-ID,
  // anonym per IP) → gekaufte Credits. Dieselbe Anzeige erneut zu öffnen
  // verbraucht nichts (Dedupe in beiden Quellen).
  const requestHeaders = await headers()
  const ip = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const usageKey = user ? user.id : `ip:${ip}`

  const summaryQuota = await consumeAiQuota({
    feature: 'summary',
    userKey: usageKey,
    userId: user?.id ?? null,
    email: user?.email,
    jobRefnr: refnr,
  })

  let summary: JobSummaryData | null = null
  if (summaryQuota.allowed) {
    summary = await getOrCreateJobSummary({
      refnr,
      titel: resolvedTitel,
      arbeitgeber: resolvedArbeitgeber,
      ort: resolvedOrt,
      beschreibung: detail.beschreibung,
    })
  }
  // Rest-Anzeige nur für die Gratis-Quelle, die Credit-Anzeige kommt mit
  // der Kauf-UI (Schritt 3)
  const summaryRemaining = summaryQuota.source === 'free' ? summaryQuota.remaining : null

  // Verfügbares Kontingent (Gratis + Credits) für Match & Anschreiben, damit
  // die Panels das Limit schon VOR dem Klick anzeigen können
  const [matchRemaining, letterRemaining] =
    user && profile
      ? await Promise.all([
          peekAiQuota('match', user.id, user.id, user.email),
          peekAiQuota('letter', user.id, user.id, user.email),
        ])
      : [null, null]

  // Anschreiben wird nicht mehr beim Seitenaufbau generiert (teurer Pro-Call,
  // blockierte das Rendering); das passiert auf Klick im CoverLetterPanel
  // und wird dort sofort gespeichert.
  const coverLetter = application?.cover_letter ?? null

  return (
    <Section className="py-10 lg:py-14">
      <Container className="max-w-3xl">
        <BackButton fallbackHref="/suche">Zurück zur Suche</BackButton>

        <div className="border-border bg-background mt-4 rounded-xl border p-6 shadow-sm lg:p-8">
          <JobHeader
            jobRefnr={refnr}
            titel={resolvedTitel}
            arbeitgeber={resolvedArbeitgeber}
            ort={resolvedOrt}
            initialIsSaved={Boolean(application)}
            isAuthenticated={Boolean(user)}
          />

          <OriginalListing kontaktEmail={detail.kontaktEmail} quelleUrl={detail.quelleUrl} />
        </div>

        {summary ? (
          <>
            <JobSummary summary={summary} />
            {summaryRemaining != null && (
              <UsageRemainingHint
                label="KI-Zusammenfassungen"
                remaining={summaryRemaining}
                showLoginLink={!user}
              />
            )}
          </>
        ) : (
          <SummaryLimitNotice isAuthenticated={Boolean(user)} quelleUrl={detail.quelleUrl} />
        )}

        <MatchScore
          jobRefnr={refnr}
          titel={resolvedTitel}
          arbeitgeber={resolvedArbeitgeber}
          ort={resolvedOrt}
          isAuthenticated={Boolean(user)}
          hasProfile={Boolean(profile)}
          initialRemaining={matchRemaining}
          initialResult={
            application?.match_score != null
              ? {
                  score: application.match_score,
                  begruendung: (application.match_begruendung as string[] | null) ?? [],
                }
              : null
          }
        />

        <CoverLetterPanel
          jobRefnr={refnr}
          titel={resolvedTitel}
          arbeitgeber={resolvedArbeitgeber}
          ort={resolvedOrt}
          kontaktEmail={detail.kontaktEmail}
          isAuthenticated={Boolean(user)}
          hasProfile={Boolean(profile)}
          initialRemaining={letterRemaining}
          initialCoverLetter={coverLetter}
          senderName={profile?.full_name ?? null}
          senderStreet={profile?.street ?? null}
          senderLocation={profile?.location ?? null}
        />

        <ApplicationChecklist
          jobRefnr={refnr}
          titel={resolvedTitel}
          arbeitgeber={resolvedArbeitgeber}
          ort={resolvedOrt}
          isAuthenticated={Boolean(user)}
          initialStatus={(application?.status as ApplicationStatus | undefined) ?? 'gespeichert'}
          initialNotes={application?.notes ?? ''}
        />
      </Container>
    </Section>
  )
}
