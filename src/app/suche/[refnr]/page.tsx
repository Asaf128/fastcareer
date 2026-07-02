import type { Metadata } from 'next'
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
import { getJobDetail } from '@/lib/jobs/arbeitsagentur-detail'
import { getOrCreateJobSummary } from '@/lib/jobs/jobSummaryCache'
import { createClient } from '@/lib/supabase/server'
import type { ApplicationStatus } from '@/types/application.types'

interface JobDetailPageProps {
  params: Promise<{ refnr: string }>
  searchParams: Promise<{ titel?: string; arbeitgeber?: string; ort?: string }>
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { refnr } = await params
  return { title: `Stellenangebot ${refnr}` }
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
  // tragen keine titel/arbeitgeber-Query-Params — ohne Fallback schlugen
  // dort Anschreiben- und Match-Generierung fehl ("Ungültige Job-Daten")
  const resolvedTitel = titel ?? application?.titel ?? 'Stellenangebot'
  const resolvedArbeitgeber = arbeitgeber ?? application?.arbeitgeber ?? ''
  const resolvedOrt = ort ?? application?.ort ?? ''

  const summary = await getOrCreateJobSummary({
    refnr,
    titel: resolvedTitel,
    arbeitgeber: resolvedArbeitgeber,
    ort: resolvedOrt,
    beschreibung: detail.beschreibung,
  })

  // Anschreiben wird nicht mehr beim Seitenaufbau generiert (teurer Pro-Call,
  // blockierte das Rendering) — das passiert auf Klick im CoverLetterPanel
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

        <JobSummary summary={summary} />

        <MatchScore
          jobRefnr={refnr}
          titel={resolvedTitel}
          arbeitgeber={resolvedArbeitgeber}
          ort={resolvedOrt}
          isAuthenticated={Boolean(user)}
          hasProfile={Boolean(profile)}
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
          initialCoverLetter={coverLetter}
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
