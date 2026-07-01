import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

export default function Loading() {
  return (
    <Section className="py-10 lg:py-14" aria-busy="true">
      <Container className="max-w-3xl">
        <span className="sr-only" role="status">
          Stellenangebot wird geladen …
        </span>

        <div className="bg-surface h-5 w-32 animate-pulse rounded-lg" />

        <div className="border-border bg-background mt-4 rounded-xl border p-6 shadow-sm lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="bg-surface h-7 w-2/3 animate-pulse rounded-lg" />
              <div className="mt-3 flex gap-4">
                <div className="bg-surface h-4 w-32 animate-pulse rounded" />
                <div className="bg-surface h-4 w-24 animate-pulse rounded" />
              </div>
            </div>
            <div className="bg-surface h-9 w-9 shrink-0 animate-pulse rounded-lg" />
          </div>

          <div className="border-border mt-8 border-t pt-6">
            <div className="bg-surface h-4 w-40 animate-pulse rounded" />
            <div className="bg-surface mt-3 h-10 w-56 animate-pulse rounded-lg" />
          </div>
        </div>

        <div className="border-border bg-background mt-6 rounded-xl border p-6 shadow-sm lg:p-8">
          <div className="bg-surface h-5 w-48 animate-pulse rounded" />
          <div className="mt-4 space-y-2">
            <div className="bg-surface h-3 w-full animate-pulse rounded" />
            <div className="bg-surface h-3 w-full animate-pulse rounded" />
            <div className="bg-surface h-3 w-2/3 animate-pulse rounded" />
          </div>
        </div>

        <div className="border-border bg-background mt-6 rounded-xl border p-6 shadow-sm lg:p-8">
          <div className="bg-surface h-5 w-40 animate-pulse rounded" />
          <div className="bg-surface mt-4 h-32 w-full animate-pulse rounded-lg" />
        </div>

        <div className="border-border bg-background mt-6 rounded-xl border p-6 shadow-sm lg:p-8">
          <div className="bg-surface h-5 w-44 animate-pulse rounded" />
          <div className="mt-4 flex gap-6">
            <div className="bg-surface h-4 w-24 animate-pulse rounded" />
            <div className="bg-surface h-4 w-24 animate-pulse rounded" />
          </div>
        </div>
      </Container>
    </Section>
  )
}
