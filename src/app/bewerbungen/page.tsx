import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bookmark, MapPin } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { SaveJobButton } from '@/components/jobs/SaveJobButton'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/cn'
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from '@/types/application.types'

export const metadata: Metadata = {
  title: 'Meine Bewerbungen',
}

const STATUS_BADGE_CLASSES: Record<ApplicationStatus, string> = {
  gespeichert: 'bg-surface text-text-secondary',
  beworben: 'bg-accent/10 text-accent',
  interview: 'bg-warning/10 text-warning',
  zusage: 'bg-success/10 text-success',
  absage: 'bg-error/10 text-error',
}

interface BewerbungenPageProps {
  searchParams: Promise<{ status?: string }>
}

function isApplicationStatus(value: string | undefined): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus)
}

export default async function BewerbungenPage({ searchParams }: BewerbungenPageProps) {
  const { status: statusParam } = await searchParams
  const activeFilter = isApplicationStatus(statusParam) ? statusParam : null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/bewerbungen')

  let query = supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (activeFilter) query = query.eq('status', activeFilter)

  const { data: applications } = await query

  return (
    <Section className="py-10 lg:py-14">
      <Container>
        <h1 className="text-foreground text-2xl lg:text-3xl">Meine Bewerbungen</h1>
        <p className="text-text-secondary mt-1 mb-6 text-sm">
          Deine gespeicherten Stellenangebote und dein Bewerbungsstand an einem Ort.
        </p>

        <nav aria-label="Nach Status filtern" className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/bewerbungen"
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-150',
              activeFilter === null
                ? 'border-accent bg-accent text-white'
                : 'border-border text-text-secondary hover:border-accent hover:text-accent'
            )}
          >
            Alle
          </Link>
          {APPLICATION_STATUSES.map((value) => (
            <Link
              key={value}
              href={`/bewerbungen?status=${value}`}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-150',
                activeFilter === value
                  ? 'border-accent bg-accent text-white'
                  : 'border-border text-text-secondary hover:border-accent hover:text-accent'
              )}
            >
              {APPLICATION_STATUS_LABELS[value]}
            </Link>
          ))}
        </nav>

        {!applications || applications.length === 0 ? (
          <div className="border-border bg-surface flex flex-col items-center gap-3 rounded-xl border p-10 text-center">
            <Bookmark className="text-text-secondary h-8 w-8" />
            <p className="text-text-secondary text-sm">
              {activeFilter ? (
                <>
                  Keine Bewerbungen mit Status &quot;{APPLICATION_STATUS_LABELS[activeFilter]}
                  &quot;.
                </>
              ) : (
                <>
                  Noch keine Jobs gespeichert.{' '}
                  <Link href="/suche" className="text-accent">
                    Jetzt Jobs durchsuchen
                  </Link>
                </>
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {applications.map((application) => {
              const status = isApplicationStatus(application.status)
                ? application.status
                : 'gespeichert'
              const detailQuery = new URLSearchParams({
                titel: application.titel,
                arbeitgeber: application.arbeitgeber,
                ort: application.ort ?? '',
              })
              return (
                <div
                  key={application.id}
                  className="border-border bg-background relative flex items-start gap-4 rounded-xl border p-5 shadow-sm transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Link
                    href={`/suche/${encodeURIComponent(application.job_refnr)}?${detailQuery.toString()}`}
                    className="absolute inset-0"
                  >
                    <span className="sr-only">{application.titel} ansehen</span>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground truncate text-base font-semibold">
                      {application.titel}
                    </h3>
                    <p className="text-text-secondary mt-1 text-sm">{application.arbeitgeber}</p>
                    {application.ort && (
                      <p className="text-text-secondary mt-2 flex items-center gap-1 text-xs">
                        <MapPin className="h-3.5 w-3.5" />
                        {application.ort}
                      </p>
                    )}

                    <div className="mt-3">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-medium',
                          STATUS_BADGE_CLASSES[status]
                        )}
                      >
                        {APPLICATION_STATUS_LABELS[status]}
                      </span>
                    </div>
                  </div>

                  <SaveJobButton
                    jobRefnr={application.job_refnr}
                    titel={application.titel}
                    arbeitgeber={application.arbeitgeber}
                    ort={application.ort ?? ''}
                    initialIsSaved
                    isAuthenticated
                  />
                </div>
              )
            })}
          </div>
        )}
      </Container>
    </Section>
  )
}
