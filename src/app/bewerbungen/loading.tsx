import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

export default function Loading() {
  return (
    <Section className="py-10 lg:py-14" aria-busy="true">
      <Container>
        <span className="sr-only" role="status">
          Bewerbungen werden geladen …
        </span>

        <div className="bg-surface h-8 w-56 animate-pulse rounded-lg" />
        <div className="bg-surface mt-2 mb-6 h-4 w-80 animate-pulse rounded-lg" />

        <div className="mb-6 hidden gap-2 sm:flex">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface h-8 w-24 animate-pulse rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-border rounded-xl border p-5">
              <div className="bg-surface h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-surface mt-2 h-3 w-1/2 animate-pulse rounded" />
              <div className="bg-surface mt-4 h-5 w-20 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
