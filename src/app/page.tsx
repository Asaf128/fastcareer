import Link from 'next/link'
import { Bookmark, Search, Send } from 'lucide-react'
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

const STEPS = [
  {
    icon: Search,
    title: 'Suchen',
    description: 'Beruf und Ort eingeben — Fastcareer durchsucht die Arbeitsagentur-Datenbank.',
  },
  {
    icon: Bookmark,
    title: 'Merken',
    description: 'Interessante Stellen auf deine persönliche Merkliste legen.',
  },
  {
    icon: Send,
    title: 'Bewerben',
    description: 'Direkt beim Original-Stellenangebot bewerben, ohne Umwege.',
  },
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

      <Section className="bg-surface py-14 lg:py-20">
        <Container>
          <h2 className="text-foreground text-center text-2xl lg:text-3xl">
            So funktioniert&apos;s
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="text-center">
                <div className="bg-accent/10 text-accent mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="text-foreground mt-4 text-lg">{step.title}</h3>
                <p className="text-text-secondary mt-2 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  )
}
