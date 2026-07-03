'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from '@/types/application.types'

interface StatusFilterPagerProps {
  activeFilter: ApplicationStatus | null
  children: React.ReactNode
}

// Reihenfolge der Kategorien: "Alle" + die Status-Pipeline
const PAGES: (ApplicationStatus | null)[] = [null, ...APPLICATION_STATUSES]

const SWIPE_THRESHOLD = 48

function pageHref(status: ApplicationStatus | null): string {
  return status ? `/bewerbungen?status=${status}` : '/bewerbungen'
}

/**
 * Status-Filter für "Meine Bewerbungen" — Desktop-Chips und mobiler
 * Pfeil-/Swipe-Umschalter teilen sich denselben optimistischen Zustand: Ein
 * Klick/Swipe wechselt die aktive Kategorie SOFORT (statt auf die
 * Server-Navigation zu warten, die spürbar hinterherhinkte) und dimmt die
 * Liste, bis die neuen Daten da sind.
 */
export function StatusFilterPager({ activeFilter, children }: StatusFilterPagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  // Optimistischer Anzeige-Status: die Pille wechselt SOFORT beim Klick/Swipe,
  // statt auf die Server-Navigation zu warten (die spürbar hinterherhinkte).
  // `undefined` = kein Override aktiv, dann zählt der echte activeFilter.
  const [optimisticFilter, setOptimisticFilter] = useState<ApplicationStatus | null | undefined>(
    undefined
  )
  // "State während des Renderns anpassen"-Pattern statt useEffect: sobald die
  // Server-Navigation (z. B. auch der Zurück-Button) den echten activeFilter
  // ändert, verwirft React das Override im selben Render, ohne einen
  // zusätzlichen Effekt-Durchlauf zu brauchen
  const [lastActiveFilter, setLastActiveFilter] = useState(activeFilter)
  if (activeFilter !== lastActiveFilter) {
    setLastActiveFilter(activeFilter)
    setOptimisticFilter(undefined)
  }
  const displayedFilter = optimisticFilter !== undefined ? optimisticFilter : activeFilter

  const index = PAGES.indexOf(displayedFilter)
  const prev = index > 0 ? PAGES[index - 1] : undefined
  const next = index < PAGES.length - 1 ? PAGES[index + 1] : undefined

  function goTo(status: ApplicationStatus | null | undefined) {
    if (status === undefined || isPending || status === displayedFilter) return
    setOptimisticFilter(status)
    startTransition(() => {
      router.push(pageHref(status))
    })
  }

  function handleTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0]
    if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const start = touchStartRef.current
    touchStartRef.current = null
    const touch = event.changedTouches[0]
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    // Nur klar horizontale Gesten zählen, vertikales Scrollen nicht abfangen
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5) return
    goTo(dx < 0 ? next : prev)
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Desktop: Filter-Chips */}
      <nav aria-label="Nach Status filtern" className="mb-6 hidden flex-wrap gap-2 sm:flex">
        {PAGES.map((status) => (
          <button
            key={status ?? 'alle'}
            type="button"
            onClick={() => goTo(status)}
            disabled={isPending}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-150 disabled:cursor-default',
              displayedFilter === status
                ? 'border-accent bg-accent text-white'
                : 'border-border text-text-secondary hover:border-accent hover:text-accent'
            )}
          >
            {status ? APPLICATION_STATUS_LABELS[status] : 'Alle'}
          </button>
        ))}
      </nav>

      {/* Mobil: Pfeile + Swipe statt Chips */}
      <div className="mb-6 flex items-center justify-between gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => goTo(prev)}
          aria-label="Vorherige Kategorie"
          disabled={isPending}
          className={
            prev === undefined
              ? 'invisible p-2'
              : 'border-border text-text-secondary hover:border-accent hover:text-accent rounded-full border p-2 transition-colors duration-150 disabled:opacity-50'
          }
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span
          aria-live="polite"
          className="border-accent bg-accent rounded-full border px-5 py-1.5 text-sm font-medium text-white"
        >
          {displayedFilter ? APPLICATION_STATUS_LABELS[displayedFilter] : 'Alle'}
        </span>

        <button
          type="button"
          onClick={() => goTo(next)}
          aria-label="Nächste Kategorie"
          disabled={isPending}
          className={
            next === undefined
              ? 'invisible p-2'
              : 'border-border text-text-secondary hover:border-accent hover:text-accent rounded-full border p-2 transition-colors duration-150 disabled:opacity-50'
          }
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        aria-busy={isPending}
        className={isPending ? 'opacity-60 transition-opacity duration-150' : ''}
      >
        {children}
      </div>
    </div>
  )
}
