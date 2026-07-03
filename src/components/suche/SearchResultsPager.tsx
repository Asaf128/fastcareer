'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SearchResultsPagerProps {
  page: number
  totalPages: number
  prevHref?: string
  nextHref?: string
  children: React.ReactNode
}

/**
 * Umschließt die Ergebnisliste samt Zurück/Weiter-Nav: ein Klick auf
 * Zurück/Weiter dimmt die Liste sofort und deaktiviert die Buttons, bis die
 * neue Seite da ist, statt dass der Klick kommentarlos ins Leere zu laufen
 * scheint. Dasselbe Muster wie beim MobileStatusPager in den Bewerbungen.
 */
export function SearchResultsPager({
  page,
  totalPages,
  prevHref,
  nextHref,
  children,
}: SearchResultsPagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function goTo(href: string | undefined) {
    if (!href || isPending) return
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <div>
      <div
        aria-busy={isPending}
        className={isPending ? 'opacity-60 transition-opacity duration-150' : ''}
      >
        {children}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Seiten" className="mt-8 flex items-center justify-between gap-4 text-sm">
          {prevHref ? (
            <button
              type="button"
              onClick={() => goTo(prevHref)}
              disabled={isPending}
              className="border-border hover:border-accent hover:text-accent flex items-center gap-1 rounded-lg border px-3 py-2 transition-colors duration-150 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Zurück
            </button>
          ) : (
            <span />
          )}
          <span className="text-text-secondary">
            Seite {page} von {totalPages}
          </span>
          {nextHref ? (
            <button
              type="button"
              onClick={() => goTo(nextHref)}
              disabled={isPending}
              className="border-border hover:border-accent hover:text-accent flex items-center gap-1 rounded-lg border px-3 py-2 transition-colors duration-150 disabled:opacity-50"
            >
              Weiter
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  )
}
