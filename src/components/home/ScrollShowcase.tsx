'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Container } from '@/components/shared/Container'
import { cn } from '@/lib/cn'
import {
  BoardVisual,
  LetterVisual,
  PdfVisual,
  SearchVisual,
  SummaryVisual,
} from '@/components/home/showcase/visuals'

const STEPS = [
  {
    title: 'Finde deinen Job',
    text: 'Fastcareer durchsucht die offiziellen Stellen der Bundesagentur für Arbeit — nach Beruf, Ort und Arbeitszeit, mit Vorschlägen schon beim Tippen.',
    visual: <SearchVisual />,
  },
  {
    title: 'Verstehe die Stelle in Sekunden',
    text: 'Statt langer Anzeigentexte fasst die KI das Wesentliche zusammen: Aufgaben, Anforderungen, Benefits — und wie gut die Stelle zu deinem Profil passt.',
    visual: <SummaryVisual />,
  },
  {
    title: 'Anschreiben auf Knopfdruck',
    text: 'Aus deinem Profil und den Anforderungen der Stelle entsteht ein maßgeschneidertes Anschreiben — bereit zum Anpassen in deinem Ton.',
    visual: <LetterVisual />,
  },
  {
    title: 'Fertig als PDF-Brief',
    text: 'Betreff, Datum und Anschrift kontrollierst du selbst — dann lädst du dein Anschreiben im DIN-Briefformat herunter oder bewirbst dich direkt per E-Mail.',
    visual: <PdfVisual />,
  },
  {
    title: 'Behalte den Überblick',
    text: 'Von "Gespeichert" über "Interview" bis zur Zusage: Verfolge jeden Bewerbungsstand mit Notizen und Checkliste an einem Ort.',
    visual: <BoardVisual />,
  },
] as const

const STEP_COUNT = STEPS.length
// Wie nah (in px) man an der Sektion sein muss, damit ein Scroll-/Wisch-
// Impuls das Betreten auslöst — muss größer sein als der größte plausible
// Scroll-Sprung eines einzelnen Wheel-Events, sonst wird das Eintreten
// verpasst und ein kräftiger Scroll landet direkt mehrere Schritte tief
const ENTRY_BUFFER = 500
// Ab dieser Wisch-Distanz (px) gilt eine Touch-Geste als Schritt-Wechsel
const TOUCH_THRESHOLD = 28
// Nach dieser Pause ohne weitere Wheel-Events gilt die aktuelle Scroll-
// Geste (z. B. eine Trackpad-Inertia-Bewegung) als beendet
const WHEEL_GESTURE_IDLE_MS = 500
const GLIDE_DURATION_MS = 500

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

interface Range {
  top: number
  range: number
}

type Zone = 'none' | 'enterTop' | 'enterBottom' | 'inside' | 'exitTop' | 'exitBottom'

/**
 * Schrittweise Pinned-Scroll-Experience: Jede Scroll-/Wisch-Geste bewegt die
 * Sektion um GENAU einen Schritt weiter, unabhängig davon, wie kräftig
 * gescrollt wird. Das verhindert, dass eine starke Geste mehrere Schritte
 * überspringt und optisch zurückschnappt — man landet immer erst auf 01,
 * dann erst beim nächsten Impuls auf 02 usw. Realisiert über
 * event.preventDefault() auf wheel/touchmove innerhalb und beim Betreten der
 * Sektion, kombiniert mit einer eigenen, animierten scrollTo-Bewegung zum
 * jeweils nächsten Schritt.
 */
export function ScrollShowcase() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const activeStepRef = useRef(0)
  const isAnimatingRef = useRef(false)
  const wheelGestureLockRef = useRef(false)
  const wheelIdleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const touchStartYRef = useRef<number | null>(null)
  const touchDecidedRef = useRef(false)

  useEffect(() => {
    function getRange(): Range | null {
      const track = trackRef.current
      if (!track) return null
      const rect = track.getBoundingClientRect()
      const range = rect.height - window.innerHeight
      if (range <= 0) return null
      return { top: window.scrollY + rect.top, range }
    }

    function classifyZone(y: number, dir: 1 | -1, g: Range): Zone {
      const inPinned = y >= g.top - 1 && y <= g.top + g.range + 1
      if (inPinned) {
        if (dir === 1 && activeStepRef.current >= STEP_COUNT - 1) return 'exitBottom'
        if (dir === -1 && activeStepRef.current <= 0) return 'exitTop'
        return 'inside'
      }
      if (dir === 1 && y < g.top && g.top - y < ENTRY_BUFFER) return 'enterTop'
      if (dir === -1 && y > g.top + g.range && y - (g.top + g.range) < ENTRY_BUFFER)
        return 'enterBottom'
      return 'none'
    }

    function animateScrollTo(targetY: number) {
      isAnimatingRef.current = true
      const startY = window.scrollY
      const distance = targetY - startY
      const startTime = performance.now()

      function frame(now: number) {
        const t = Math.min(1, (now - startTime) / GLIDE_DURATION_MS)
        const eased = 1 - Math.pow(1 - t, 3)
        // behavior: instant — sonst würde das globale scroll-behavior:smooth
        // jeden einzelnen Frame nochmal animieren
        window.scrollTo({ top: startY + distance * eased, behavior: 'instant' })
        if (t < 1) {
          requestAnimationFrame(frame)
        } else {
          isAnimatingRef.current = false
        }
      }
      requestAnimationFrame(frame)
    }

    function goToStep(zone: Zone, dir: 1 | -1, g: Range) {
      const target =
        zone === 'enterTop'
          ? 0
          : zone === 'enterBottom'
            ? STEP_COUNT - 1
            : clamp(activeStepRef.current + dir, 0, STEP_COUNT - 1)
      activeStepRef.current = target
      setActiveStep(target)
      animateScrollTo(g.top + (target / (STEP_COUNT - 1)) * g.range)
    }

    function onWheel(e: WheelEvent) {
      if (isAnimatingRef.current) {
        e.preventDefault()
        return
      }
      const g = getRange()
      if (!g) return
      const dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0
      if (dir === 0) return
      const zone = classifyZone(window.scrollY, dir, g)
      if (zone === 'none' || zone === 'exitTop' || zone === 'exitBottom') return

      e.preventDefault()
      // Timer läuft bei jedem abgefangenen Event neu an — erst nach einer
      // echten Pause gilt die (womöglich lange) Trackpad-Geste als beendet
      clearTimeout(wheelIdleTimerRef.current)
      wheelIdleTimerRef.current = setTimeout(() => {
        wheelGestureLockRef.current = false
      }, WHEEL_GESTURE_IDLE_MS)
      if (wheelGestureLockRef.current) return
      wheelGestureLockRef.current = true

      goToStep(zone, dir, g)
    }

    function onTouchStart(e: TouchEvent) {
      if (isAnimatingRef.current) return
      const touch = e.touches[0]
      if (!touch) return
      touchStartYRef.current = touch.clientY
      touchDecidedRef.current = false
    }

    function onTouchMove(e: TouchEvent) {
      if (isAnimatingRef.current) {
        e.preventDefault()
        return
      }
      const startY = touchStartYRef.current
      const touch = e.touches[0]
      if (startY === null || !touch) return

      const dy = startY - touch.clientY
      const dir = dy > 0 ? 1 : dy < 0 ? -1 : 0
      if (dir === 0) return

      const g = getRange()
      if (!g) return
      const zone = classifyZone(window.scrollY, dir, g)
      if (zone === 'none' || zone === 'exitTop' || zone === 'exitBottom') {
        // Außerhalb unseres Einflussbereichs — restliche Geste normal scrollen lassen
        touchStartYRef.current = null
        return
      }

      e.preventDefault()
      if (touchDecidedRef.current) return
      if (Math.abs(dy) < TOUCH_THRESHOLD) return

      touchDecidedRef.current = true
      goToStep(zone, dir, g)
    }

    function onTouchEnd() {
      touchStartYRef.current = null
      touchDecidedRef.current = false
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      clearTimeout(wheelIdleTimerRef.current)
    }
  }, [])

  return (
    <section className="bg-surface border-border border-t">
      {/* Hoher Track: 100svh Scrollweg pro Schritt, darin klebt der Viewport */}
      <div ref={trackRef} className="relative h-[500svh]">
        <div className="sticky top-0 flex h-svh items-center overflow-hidden">
          {STEPS.map((step, index) => {
            const distance = activeStep - index
            return (
              <div
                key={step.title}
                aria-hidden={index !== activeStep ? 'true' : 'false'}
                className={cn(
                  'absolute inset-0 flex items-center transition-[opacity,transform] duration-500 ease-out',
                  distance === 0 && 'translate-y-0 opacity-100',
                  distance > 0 && '-translate-y-16 opacity-0',
                  distance < 0 && 'translate-y-16 opacity-0',
                  index !== activeStep && 'pointer-events-none'
                )}
              >
                <Container className="w-full">
                  <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                    <div className={cn(index % 2 === 1 && 'lg:order-2')}>
                      <span className="text-accent font-display text-sm font-semibold tracking-widest">
                        {String(index + 1).padStart(2, '0')} / {String(STEP_COUNT).padStart(2, '0')}
                      </span>
                      <h3 className="text-foreground mt-2 text-2xl lg:text-3xl">{step.title}</h3>
                      <p className="text-text-secondary mt-3 max-w-md text-sm leading-relaxed lg:text-base">
                        {step.text}
                      </p>
                    </div>
                    {/* UI-Mock ist rein dekorativ — Screenreader lesen nur den Text */}
                    <div aria-hidden>{step.visual}</div>
                  </div>
                </Container>
              </div>
            )
          })}
        </div>
      </div>

      <Container className="pt-4 pb-16 lg:pb-24">
        <p className="text-text-secondary text-center text-sm">
          Kostenlos und ohne Passwort —{' '}
          <Link href="/login" className="text-accent hover:underline">
            mit E-Mail-Code anmelden
          </Link>{' '}
          und loslegen.
        </p>
      </Container>
    </section>
  )
}
