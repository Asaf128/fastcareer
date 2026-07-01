import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { getJobDetail } from '@/lib/jobs/arbeitsagentur-detail'

interface JobDetailPageProps {
  params: Promise<{ refnr: string }>
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { refnr } = await params
  return { title: `Stellenangebot ${refnr}` }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { refnr } = await params

  let detail
  try {
    detail = await getJobDetail(refnr)
  } catch {
    notFound()
  }

  return (
    <Section className="py-16 lg:py-24">
      <Container className="max-w-3xl">
        <Link href="/suche" className="text-text-secondary text-xs tracking-[0.2em] uppercase">
          ← Zurück zur Suche
        </Link>

        <h1 className="text-foreground mt-6 text-3xl lg:text-4xl">Stellenangebot</h1>
        <div className="bg-accent mt-4 mb-8 h-px w-16" />

        <p className="text-text-primary text-sm whitespace-pre-line">
          {detail.beschreibung || 'Keine Beschreibung verfügbar.'}
        </p>

        <div className="border-border mt-10 border-t pt-8">
          <h2 className="text-lg">Kontakt & Bewerbung</h2>
          {detail.kontaktEmail ? (
            <p className="mt-2 text-sm">
              <a href={`mailto:${detail.kontaktEmail}`} className="text-accent underline">
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
            className="bg-foreground text-text-on-dark mt-4 inline-block px-6 py-3 text-sm font-medium tracking-[0.15em] uppercase shadow-lg transition-all duration-300 hover:bg-[var(--surface-dark)] hover:shadow-xl"
          >
            Original-Stellenangebot öffnen
          </a>
        </div>
      </Container>
    </Section>
  )
}
