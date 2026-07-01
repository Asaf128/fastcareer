import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

export default function Loading() {
  return (
    <Section className="py-16 lg:py-24" aria-busy="true">
      <Container>
        <span className="sr-only" role="status">
          Jobsuche wird geladen …
        </span>

        <div className="bg-surface h-10 w-48 animate-pulse" />
        <div className="bg-accent mt-4 mb-10 h-px w-16" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="bg-surface h-12 animate-pulse sm:col-span-2" />
          <div className="bg-surface h-12 animate-pulse" />
          <div className="bg-surface h-12 animate-pulse" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-border border p-6">
              <div className="bg-surface h-3 w-24 animate-pulse" />
              <div className="bg-surface mt-3 h-5 w-3/4 animate-pulse" />
              <div className="bg-surface mt-4 h-3 w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
