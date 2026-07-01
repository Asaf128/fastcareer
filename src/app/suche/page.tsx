import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { JobSearchForm } from '@/components/suche/JobSearchForm'
import { JobCard } from '@/components/suche/JobCard'
import { searchJobs } from '@/lib/jobs/arbeitsagentur'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Jobsuche',
  description: 'Durchsuche aktuelle Stellenangebote der Bundesagentur für Arbeit.',
}

const PAGE_SIZE = 25

interface SuchePageProps {
  searchParams: Promise<{ was?: string; wo?: string; umkreis?: string; page?: string }>
}

export default async function SuchePage({ searchParams }: SuchePageProps) {
  const params = await searchParams
  const was = params.was ?? ''
  const wo = params.wo ?? ''
  const umkreis = Number(params.umkreis ?? 25)
  const page = Math.max(1, Number(params.page ?? 1))

  const result = was ? await searchJobs({ was, wo, umkreis, page, size: PAGE_SIZE }) : null
  const totalPages = result ? Math.ceil(result.gesamtTreffer / PAGE_SIZE) : 0

  function pageHref(targetPage: number) {
    const query = new URLSearchParams({ was, umkreis: String(umkreis), page: String(targetPage) })
    if (wo) query.set('wo', wo)
    return `/suche?${query.toString()}`
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let favoriteRefnrs = new Set<string>()
  if (user && result) {
    const { data } = await supabase.from('favorites').select('job_refnr').eq('user_id', user.id)
    favoriteRefnrs = new Set(data?.map((f) => f.job_refnr))
  }

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
                <JobCard
                  key={job.refnr}
                  job={job}
                  isFavorite={favoriteRefnrs.has(job.refnr)}
                  isAuthenticated={!!user}
                />
              ))}
            </div>
            {result.treffer.length === 0 && (
              <p className="text-text-secondary">
                Keine Treffer gefunden. Versuche einen anderen Suchbegriff.
              </p>
            )}

            {totalPages > 1 && (
              <nav
                aria-label="Seiten"
                className="mt-10 flex items-center justify-between gap-4 text-xs tracking-[0.15em] uppercase"
              >
                {page > 1 ? (
                  <Link
                    href={pageHref(page - 1)}
                    className="border-border hover:border-accent hover:text-accent border px-4 py-2"
                  >
                    ← Zurück
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-text-secondary">
                  Seite {page} von {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={pageHref(page + 1)}
                    className="border-border hover:border-accent hover:text-accent border px-4 py-2"
                  >
                    Weiter →
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </div>
        )}
      </Container>
    </Section>
  )
}
