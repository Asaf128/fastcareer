import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
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
    <Section className="py-16 lg:py-24">
      <Container>
        <h1 className="text-foreground text-4xl lg:text-5xl">Meine Merkliste</h1>
        <div className="bg-accent mt-4 mb-10 h-px w-16" />

        {!favorites || favorites.length === 0 ? (
          <p className="text-text-secondary text-sm">
            Noch keine Jobs gemerkt.{' '}
            <Link href="/suche" className="text-accent underline">
              Jetzt Jobs durchsuchen
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="border-border relative flex items-start justify-between gap-4 border p-6"
              >
                <Link
                  href={`/suche/${encodeURIComponent(favorite.job_refnr)}`}
                  className="absolute inset-0"
                >
                  <span className="sr-only">{favorite.titel} ansehen</span>
                </Link>
                <div>
                  <h3 className="text-foreground text-xl font-normal normal-case">
                    {favorite.titel}
                  </h3>
                  <p className="text-text-secondary mt-3 text-sm">{favorite.arbeitgeber}</p>
                  {favorite.ort && (
                    <p className="text-text-secondary mt-1 text-xs">{favorite.ort}</p>
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
