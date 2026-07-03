import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

export default function Loading() {
  return (
    <Section className="py-10 lg:py-14" aria-busy="true">
      <Container className="max-w-3xl">
        <span className="sr-only" role="status">
          Credits-Seite wird geladen …
        </span>

        <div className="bg-surface h-8 w-48 animate-pulse rounded-lg" />
        <div className="mt-2 space-y-2">
          <div className="bg-surface h-4 w-full max-w-xl animate-pulse rounded" />
          <div className="bg-surface h-4 w-2/3 max-w-xl animate-pulse rounded" />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="border-border bg-background rounded-xl border p-6 shadow-sm lg:p-8"
            >
              <div className="bg-surface h-5 w-24 animate-pulse rounded" />
              <div className="bg-surface mt-2 h-4 w-32 animate-pulse rounded" />
              <div className="bg-surface mt-4 h-8 w-20 animate-pulse rounded" />
              <div className="mt-5 mb-6 space-y-2">
                <div className="bg-surface h-4 w-full animate-pulse rounded" />
                <div className="bg-surface h-4 w-full animate-pulse rounded" />
                <div className="bg-surface h-4 w-2/3 animate-pulse rounded" />
              </div>
              <div className="bg-surface h-10 w-full animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
