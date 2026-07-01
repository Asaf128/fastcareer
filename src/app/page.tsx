import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { JobSearchForm } from '@/components/suche/JobSearchForm'

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      <Section className="pt-20 lg:pt-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-text-secondary mb-4 text-xs tracking-[0.4em] uppercase">Jobsuche</p>
            <h1 className="text-foreground text-5xl sm:text-6xl lg:text-7xl">
              Finde deinen nächsten Job
            </h1>
            <div className="bg-accent mx-auto mt-6 h-px w-16" />
            <p className="text-text-secondary mt-6">
              Fastcareer durchsucht offene Stellen der Arbeitsagentur nach Beruf und Ort — schnell,
              übersichtlich, ohne Umwege.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl">
            <JobSearchForm defaultWas="" defaultWo="" defaultUmkreis={25} />
          </div>
        </Container>
      </Section>
    </main>
  )
}
