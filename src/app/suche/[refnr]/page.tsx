import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Building2, ExternalLink, MapPin } from 'lucide-react'
import { BackButton } from '@/components/shared/BackButton'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { FavoriteButton } from '@/components/suche/FavoriteButton'
import { getJobDetail } from '@/lib/jobs/arbeitsagentur-detail'
import { createClient } from '@/lib/supabase/server'

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

  let isFavorite = false
  if (user) {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('job_refnr', refnr)
      .maybeSingle()
    isFavorite = !!data
  }

  return (
    <Section className="py-10 lg:py-14">
      <Container className="max-w-3xl">
        <BackButton fallbackHref="/suche">Zurück zur Suche</BackButton>

        <div className="border-border bg-background mt-4 rounded-xl border p-6 shadow-sm lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-foreground text-2xl lg:text-3xl">{titel ?? 'Stellenangebot'}</h1>
              <div className="text-text-secondary mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {arbeitgeber && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {arbeitgeber}
                  </span>
                )}
                {ort && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {ort}
                  </span>
                )}
              </div>
            </div>
            {titel && arbeitgeber && (
              <FavoriteButton
                jobRefnr={refnr}
                titel={titel}
                arbeitgeber={arbeitgeber}
                ort={ort ?? ''}
                initialIsFavorite={isFavorite}
                isAuthenticated={!!user}
              />
            )}
          </div>

          <p className="text-text-primary mt-6 text-sm whitespace-pre-line">
            {detail.beschreibung || 'Keine Beschreibung verfügbar.'}
          </p>

          <div className="border-border mt-8 border-t pt-6">
            <h2 className="text-base font-semibold">Kontakt &amp; Bewerbung</h2>
            {detail.kontaktEmail ? (
              <p className="mt-2 text-sm">
                <a href={`mailto:${detail.kontaktEmail}`} className="text-accent hover:underline">
                  {detail.kontaktEmail}
                </a>
              </p>
            ) : (
              <p className="text-text-secondary mt-2 text-sm">
                Der Arbeitgeber hat die Kontaktdaten auf der Arbeitsagentur-Seite gesichert. Bitte
                öffne das Original-Stellenangebot, um dich zu bewerben.
              </p>
            )}
            <a
              href={detail.quelleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-foreground hover:bg-surface-dark mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
            >
              Original-Stellenangebot öffnen
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Container>
    </Section>
  )
}
