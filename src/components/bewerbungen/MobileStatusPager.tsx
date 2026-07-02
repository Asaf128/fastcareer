'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from '@/types/application.types'

interface MobileStatusPagerProps {
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
 * Mobil ist immer nur eine Status-Kategorie sichtbar — Wechsel per
 * Pfeil-Buttons oder horizontalem Swipe über der Liste. Auf Desktop
 * bleiben die Filter-Chips, hier wird nur durchgereicht.
 */
export function MobileStatusPager({ activeFilter, children }: MobileStatusPagerProps) {
  const router = useRouter()
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  // Merkt sich die Wechselrichtung — die neue Liste gleitet passend dazu ein
  const [direction, setDirection] = useState<'prev' | 'next' | null>(null)
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

  function goTo(status: ApplicationStatus | null | undefined, towards: 'prev' | 'next') {
    if (status === undefined) return
    setDirection(towards)
    setOptimisticFilter(status)
    router.push(pageHref(status))
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
    // Nur klar horizontale Gesten zählen — vertikales Scrollen nicht abfangen
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0) goTo(next, 'next')
    else goTo(prev, 'prev')
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="mb-6 flex items-center justify-between gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => goTo(prev, 'prev')}
          aria-label="Vorherige Kategorie"
          className={
            prev === undefined
              ? 'invisible p-2'
              : 'border-border text-text-secondary hover:border-accent hover:text-accent rounded-full border p-2 transition-colors duration-150'
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
          onClick={() => goTo(next, 'next')}
          aria-label="Nächste Kategorie"
          className={
            next === undefined
              ? 'invisible p-2'
              : 'border-border text-text-secondary hover:border-accent hover:text-accent rounded-full border p-2 transition-colors duration-150'
          }
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* key remountet beim Statuswechsel — die neue Liste gleitet aus der
          Swipe-Richtung ein statt hart umzuspringen */}
      <div
        key={activeFilter ?? 'alle'}
        className={cn(
          direction === 'next' && 'animate-slide-in-right',
          direction === 'prev' && 'animate-slide-in-left'
        )}
      >
        {children}
      </div>
    </div>
  )
}
