'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

  const index = PAGES.indexOf(activeFilter)
  const prev = index > 0 ? PAGES[index - 1] : undefined
  const next = index < PAGES.length - 1 ? PAGES[index + 1] : undefined

  function goTo(status: ApplicationStatus | null | undefined) {
    if (status === undefined) return
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
    goTo(dx < 0 ? next : prev)
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="mb-6 flex items-center justify-between gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => goTo(prev)}
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
          {activeFilter ? APPLICATION_STATUS_LABELS[activeFilter] : 'Alle'}
        </span>

        <button
          type="button"
          onClick={() => goTo(next)}
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

      {children}
    </div>
  )
}
