import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bookmark, MapPin } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { RemoveFavoriteButton } from '@/components/suche/RemoveFavoriteButton'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Meine Merkliste',
}

export default async function FavoritenPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/favoriten')

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <Section className="py-10 lg:py-14">
      <Container>
        <h1 className="text-foreground text-2xl lg:text-3xl">Meine Merkliste</h1>
        <p className="text-text-secondary mt-1 mb-8 text-sm">
          Deine gemerkten Stellenangebote an einem Ort.
        </p>

        {!favorites || favorites.length === 0 ? (
          <div className="border-border bg-surface flex flex-col items-center gap-3 rounded-xl border p-10 text-center">
            <Bookmark className="text-text-secondary h-8 w-8" />
            <p className="text-text-secondary text-sm">
              Noch keine Jobs gemerkt.{' '}
              <Link href="/suche" className="text-accent">
                Jetzt Jobs durchsuchen
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="border-border bg-background relative flex items-start gap-4 rounded-xl border p-5 shadow-sm transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link
                  href={`/suche/${encodeURIComponent(favorite.job_refnr)}`}
                  className="absolute inset-0"
                >
                  <span className="sr-only">{favorite.titel} ansehen</span>
                </Link>

                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground truncate text-base font-semibold">
                    {favorite.titel}
                  </h3>
                  <p className="text-text-secondary mt-1 text-sm">{favorite.arbeitgeber}</p>
                  {favorite.ort && (
                    <p className="text-text-secondary mt-2 flex items-center gap-1 text-xs">
                      <MapPin className="h-3.5 w-3.5" />
                      {favorite.ort}
                    </p>
                  )}
                </div>

                <RemoveFavoriteButton jobRefnr={favorite.job_refnr} />
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}
