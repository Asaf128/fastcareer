import type { Metadata } from 'next'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { JobSearchForm } from '@/components/suche/JobSearchForm'
import { JobCard } from '@/components/suche/JobCard'
import { searchJobs } from '@/lib/jobs/arbeitsagentur'

export const metadata: Metadata = {
  title: 'Jobsuche',
  description: 'Durchsuche aktuelle Stellenangebote der Bundesagentur für Arbeit.',
}

interface SuchePageProps {
  searchParams: Promise<{ was?: string; wo?: string; umkreis?: string }>
}

export default async function SuchePage({ searchParams }: SuchePageProps) {
  const params = await searchParams
  const was = params.was ?? ''
  const wo = params.wo ?? ''
  const umkreis = Number(params.umkreis ?? 25)

  const result = was ? await searchJobs({ was, wo, umkreis }) : null

  return (
    <Section className="py-16 lg:py-24">
      <Container>
        <h1 className="text-foreground text-4xl lg:text-5xl">Jobsuche</h1>
        <div className="bg-accent mt-4 mb-10 h-px w-16" />

        <JobSearchForm defaultWas={was} defaultWo={wo} defaultUmkreis={umkreis} />

        {result && (
          <div className="mt-12">
            <p className="text-text-secondary mb-6 text-sm">
              {result.gesamtTreffer.toLocaleString('de-DE')} Treffer für &quot;{was}&quot;
              {wo && ` in ${wo}`}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {result.treffer.map((job) => (
                <JobCard key={job.refnr} job={job} />
              ))}
            </div>
            {result.treffer.length === 0 && (
              <p className="text-text-secondary">Keine Treffer gefunden. Versuche einen anderen Suchbegriff.</p>
            )}
          </div>
        )}
      </Container>
    </Section>
  )
}
