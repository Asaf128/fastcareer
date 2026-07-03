import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

export default function Loading() {
  return (
    <Section className="py-10 lg:py-14" aria-busy="true">
      <Container className="max-w-2xl">
        <span className="sr-only" role="status">
          Profil wird geladen …
        </span>

        <div className="bg-surface h-8 w-40 animate-pulse rounded-lg" />
        <div className="bg-surface mt-2 mb-8 h-4 w-72 animate-pulse rounded-lg" />

        <div className="border-border space-y-4 rounded-xl border p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-surface h-11 animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="bg-surface h-11 animate-pulse rounded-lg" />
          <div className="bg-surface h-28 animate-pulse rounded-lg" />
        </div>

        <div className="bg-surface mt-8 h-24 animate-pulse rounded-xl" />
      </Container>
    </Section>
  )
}
