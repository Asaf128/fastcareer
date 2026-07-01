import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

export default function Loading() {
  return (
    <Section className="py-10 lg:py-14" aria-busy="true">
      <Container>
        <span className="sr-only" role="status">
          Jobsuche wird geladen …
        </span>

        <div className="bg-surface h-8 w-48 animate-pulse rounded-lg" />
        <div className="bg-surface mt-2 mb-6 h-4 w-72 animate-pulse rounded-lg" />

        <div className="border-border rounded-xl border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="bg-surface h-11 animate-pulse rounded-lg sm:col-span-2" />
            <div className="bg-surface h-11 animate-pulse rounded-lg" />
            <div className="bg-surface h-11 animate-pulse rounded-lg" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-border flex gap-4 rounded-xl border p-5">
              <div className="bg-surface h-11 w-11 shrink-0 animate-pulse rounded-lg" />
              <div className="flex-1">
                <div className="bg-surface h-3 w-24 animate-pulse rounded" />
                <div className="bg-surface mt-2 h-4 w-3/4 animate-pulse rounded" />
                <div className="bg-surface mt-2 h-3 w-1/2 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
