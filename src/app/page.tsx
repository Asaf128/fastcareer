import Link from 'next/link'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { JobSearchForm } from '@/components/suche/JobSearchForm'

const POPULAR_SEARCHES = [
  'Verkäufer',
  'Lagerhelfer',
  'Pflegefachkraft',
  'IT',
  'Ausbildung',
  'Home-Office',
]

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      <Section className="pt-14 pb-10 lg:pt-20 lg:pb-14">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-foreground text-3xl sm:text-4xl lg:text-5xl">
              Finde deinen nächsten Job
            </h1>
            <p className="text-text-secondary mt-3 text-base">
              Fastcareer durchsucht offene Stellen der Arbeitsagentur nach Beruf und Ort — schnell,
              übersichtlich, ohne Umwege.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-4xl">
            <JobSearchForm defaultWas="" defaultWo="" defaultUmkreis={25} />
          </div>

          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-2">
            <span className="text-text-secondary text-sm">Beliebte Suchen:</span>
            {POPULAR_SEARCHES.map((suche) => (
              <Link
                key={suche}
                href={`/suche?was=${encodeURIComponent(suche)}`}
                className="border-border text-text-secondary hover:border-accent hover:text-accent rounded-full border px-3 py-1 text-sm transition-colors duration-150"
              >
                {suche}
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  )
}
