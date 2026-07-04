import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, SearchX } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { JobSearchForm } from '@/components/suche/JobSearchForm'
import { JobCard } from '@/components/suche/JobCard'
import { SearchResultsPager } from '@/components/suche/SearchResultsPager'
import { searchJobs } from '@/lib/jobs/arbeitsagentur'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import type { Arbeitszeit } from '@/types/job.types'

export const metadata: Metadata = {
  title: 'Jobsuche',
  description: 'Durchsuche aktuelle Stellenangebote der Bundesagentur für Arbeit.',
}

const PAGE_SIZE = 25

interface SuchePageProps {
  searchParams: Promise<{
    was?: string
    wo?: string
    umkreis?: string
    page?: string
    arbeitszeit?: string
  }>
}

export default async function SuchePage({ searchParams }: SuchePageProps) {
  const params = await searchParams
  const was = params.was ?? ''
  const wo = params.wo ?? ''
  const umkreis = Number(params.umkreis ?? 25)
  const page = Math.max(1, Number(params.page ?? 1))
  // Ohne Param gilt Vollzeit, konsistent zum Default im Suchformular
  const arbeitszeit = (params.arbeitszeit as Arbeitszeit | undefined) ?? 'vz'

  let result: Awaited<ReturnType<typeof searchJobs>> | null = null
  let searchFailed = false

  if (was) {
    try {
      result = await searchJobs({
        was,
        wo,
        umkreis,
        page,
        size: PAGE_SIZE,
        arbeitszeit: arbeitszeit || undefined,
      })
    } catch {
      searchFailed = true
    }
  }

  const totalPages = result ? Math.ceil(result.gesamtTreffer / PAGE_SIZE) : 0

  function pageHref(targetPage: number) {
    const query = new URLSearchParams({ was, umkreis: String(umkreis), page: String(targetPage) })
    if (wo) query.set('wo', wo)
    if (arbeitszeit) query.set('arbeitszeit', arbeitszeit)
    return `/suche?${query.toString()}`
  }

  const user = await getAuthUser()

  let savedRefnrs = new Set<string>()
  if (user && result) {
    const supabase = await createClient()
    const { data } = await supabase.from('applications').select('job_refnr').eq('user_id', user.id)
    savedRefnrs = new Set(data?.map((application) => application.job_refnr))
  }

  return (
    <Section className="py-10 lg:py-14">
      <Container>
        <h1 className="text-foreground mb-6 text-2xl lg:text-3xl">Jobsuche</h1>

        <JobSearchForm
          defaultWas={was}
          defaultWo={wo}
          defaultUmkreis={umkreis}
          defaultArbeitszeit={arbeitszeit}
        />

        {searchFailed && (
          <div className="border-border bg-surface mt-8 flex items-start gap-3 rounded-xl border p-5">
            <AlertCircle className="text-error mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-text-primary text-sm">
                Die Jobsuche ist gerade nicht erreichbar. Das liegt in der Regel an der
                Schnittstelle der Bundesagentur für Arbeit, nicht an deiner Eingabe.
              </p>
              <Link href={pageHref(page)} className="text-accent mt-2 inline-block text-sm">
                Erneut versuchen
              </Link>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8">
            <SearchResultsPager
              page={page}
              totalPages={totalPages}
              prevHref={page > 1 ? pageHref(page - 1) : undefined}
              nextHref={page < totalPages ? pageHref(page + 1) : undefined}
            >
              <p className="text-text-secondary mb-4 text-sm">
                {result.gesamtTreffer.toLocaleString('de-DE')} Treffer für &quot;{was}&quot;
                {wo && ` in ${wo}`}
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {result.treffer.map((job) => (
                  <JobCard
                    key={job.refnr}
                    job={job}
                    isSaved={savedRefnrs.has(job.refnr)}
                    isAuthenticated={!!user}
                  />
                ))}
              </div>
              {result.treffer.length === 0 && (
                <div className="border-border bg-surface flex flex-col items-center gap-3 rounded-xl border p-10 text-center">
                  <SearchX className="text-text-secondary h-8 w-8" />
                  <p className="text-text-secondary text-sm">
                    Keine Treffer gefunden. Versuche einen anderen Suchbegriff.
                  </p>
                </div>
              )}
            </SearchResultsPager>
          </div>
        )}
      </Container>
    </Section>
  )
}
