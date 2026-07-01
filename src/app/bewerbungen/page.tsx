import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bookmark, MapPin } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { SaveJobButton } from '@/components/jobs/SaveJobButton'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Meine Bewerbungen',
}

export default async function BewerbungenPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/bewerbungen')

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <Section className="py-10 lg:py-14">
      <Container>
        <h1 className="text-foreground text-2xl lg:text-3xl">Meine Bewerbungen</h1>
        <p className="text-text-secondary mt-1 mb-8 text-sm">
          Deine gespeicherten Stellenangebote und dein Bewerbungsstand an einem Ort.
        </p>

        {!applications || applications.length === 0 ? (
          <div className="border-border bg-surface flex flex-col items-center gap-3 rounded-xl border p-10 text-center">
            <Bookmark className="text-text-secondary h-8 w-8" />
            <p className="text-text-secondary text-sm">
              Noch keine Jobs gespeichert.{' '}
              <Link href="/suche" className="text-accent">
                Jetzt Jobs durchsuchen
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {applications.map((application) => (
              <div
                key={application.id}
                className="border-border bg-background relative flex items-start gap-4 rounded-xl border p-5 shadow-sm transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link
                  href={`/suche/${encodeURIComponent(application.job_refnr)}`}
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

                  <div className="mt-3 flex flex-wrap gap-2">
                    {application.applied && (
                      <span className="bg-accent/10 text-accent rounded-full px-2.5 py-0.5 text-xs font-medium">
                        Beworben
                      </span>
                    )}
                    {application.answered && (
                      <span className="bg-success/10 text-success rounded-full px-2.5 py-0.5 text-xs font-medium">
                        Geantwortet
                      </span>
                    )}
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
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}
