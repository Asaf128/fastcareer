'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Container } from '@/components/shared/Container'
import { cn } from '@/lib/cn'
import { SHOWCASE_STEPS as STEPS } from '@/components/home/showcase/steps'

const STEP_COUNT = STEPS.length
// Wie nah (px) über/unter der Sektion ein Scroll-Impuls das Betreten auslöst,
// größer als der größte plausible Sprung eines einzelnen Wheel-Events
const ENTRY_BUFFER = 500
// Akkumulierte Wheel-Distanz, ab der ein Schritt ausgelöst wird
const WHEEL_TRIGGER_DELTA = 30
// Pause ohne Wheel-Events, nach der der Akkumulator neu ansetzt
const WHEEL_ACCUM_RESET_MS = 300
// Nach einem Glide gelten gleichgerichtete Wheel-Events so lange als
// Inertia-Rest der vorherigen Geste; Gegenrichtung greift sofort
const SAME_DIR_COOLDOWN_MS = 450
// Ab dieser Wisch-Distanz (px) löst eine Touch-Geste einen Schritt aus
const TOUCH_TRIGGER_DELTA = 24
const GLIDE_MS = 600
// Prüf-Intervall + Bewegungs-Schwelle fürs Einrasten: sobald sich die Seite
// innerhalb eines Ticks kaum noch bewegt (iOS-Momentum klingt aus), wird
// sofort eingerastet, denn ein Timer, der bei jedem Scroll-Event neu startet,
// würde erst Sekunden nach dem Ausrollen greifen
const SETTLE_POLL_MS = 100
const SETTLE_SPEED_PX = 8

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

interface Geometry {
  top: number
  range: number
}

type Zone = 'none' | 'enterTop' | 'enterBottom' | 'inside' | 'exitTop' | 'exitBottom'

/**
 * Pinned-Scroll-Experience: Die Optik hängt kontinuierlich an der
 * Scroll-Position (weiches Ein-/Ausfaden statt hartem Umschalten), die
 * Steuerung läuft schrittweise: jede Scroll-/Wisch-Geste bewegt genau einen
 * Schritt, angefahren mit einer eigenen Glide-Animation. Richtungswechsel
 * greifen sofort (auch mitten im Glide), gleichgerichtete Inertia-Reste
 * werden kurz ignoriert. Tastatur/Scrollbar bleiben nativ; ein Settle-Snap
 * rastet frei erreichte Zwischenpositionen nachträglich ein.
 */
export function ScrollShowcase() {
  const trackRef = useRef<HTMLDivElement>(null)
  // Kontinuierlicher Fortschritt 0 … STEP_COUNT-1, direkt aus der Scroll-Position
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let scrollFrame = 0
    let glideFrame = 0
    let isGliding = false
    let glideDir = 0
    let glideEndAt = 0
    let lastGlideDir = 0
    // Der Schritt, auf dem wir stehen bzw. den der laufende Glide ansteuert
    let targetStep = 0
    let wheelAccum = 0
    let wheelDir = 0
    let lastWheelAt = 0
    let settlePoll: ReturnType<typeof setInterval> | undefined
    let lastPollY = 0
    let touchY: number | null = null
    let touchDone = false

    function getGeometry(): Geometry | null {
      const track = trackRef.current
      if (!track) return null
      const rect = track.getBoundingClientRect()
      const range = rect.height - window.innerHeight
      if (range <= 0) return null
      return { top: window.scrollY + rect.top, range }
    }

    function render() {
      scrollFrame = 0
      const g = getGeometry()
      if (!g) return
      const p = clamp((window.scrollY - g.top) / g.range, 0, 1) * (STEP_COUNT - 1)
      setProgress(p)
      // Native Bewegungen (Scrollbar, Tastatur) halten den Schritt-Anker synchron
      if (!isGliding) targetStep = Math.round(p)
    }

    function onScroll() {
      if (scrollFrame === 0) scrollFrame = requestAnimationFrame(render)
      if (!isGliding) startSettlePoll()
    }

    function glideTo(step: number, g: Geometry) {
      targetStep = step
      const targetY = g.top + (step / (STEP_COUNT - 1)) * g.range
      const startY = window.scrollY
      const distance = targetY - startY
      if (Math.abs(distance) < 1) return
      cancelAnimationFrame(glideFrame)
      isGliding = true
      glideDir = Math.sign(distance)
      const startTime = performance.now()

      function frame(now: number) {
        const t = Math.min(1, (now - startTime) / GLIDE_MS)
        const eased = 1 - Math.pow(1 - t, 3)
        window.scrollTo({ top: startY + distance * eased, behavior: 'instant' })
        if (t < 1) {
          glideFrame = requestAnimationFrame(frame)
        } else {
          isGliding = false
          glideEndAt = performance.now()
          lastGlideDir = glideDir
        }
      }
      glideFrame = requestAnimationFrame(frame)
    }

    function stopSettlePoll() {
      clearInterval(settlePoll)
      settlePoll = undefined
    }

    // Frei erreichte Zwischenposition (iOS-Momentum, Scrollbar-Drag, Tastatur)
    // einrasten, sobald die Bewegung fast abgeklungen ist, nicht erst, wenn
    // das letzte Momentum-Event verhallt ist
    function startSettlePoll() {
      if (settlePoll !== undefined) return
      lastPollY = window.scrollY
      settlePoll = setInterval(() => {
        const y = window.scrollY
        const moved = Math.abs(y - lastPollY)
        lastPollY = y
        if (isGliding) return
        const g = getGeometry()
        if (!g) {
          stopSettlePoll()
          return
        }
        const p = (y - g.top) / g.range
        if (p <= 0 || p >= 1) {
          stopSettlePoll()
          return
        }
        // Bei ruhendem Finger nicht gegen die aktive Touch-Geste anrasten
        if (moved < SETTLE_SPEED_PX && touchY === null) {
          stopSettlePoll()
          glideTo(Math.round(p * (STEP_COUNT - 1)), g)
        }
      }, SETTLE_POLL_MS)
    }

    function zoneFor(dir: number, g: Geometry): Zone {
      const y = window.scrollY
      if (y >= g.top - 1 && y <= g.top + g.range + 1) {
        if (dir > 0 && targetStep >= STEP_COUNT - 1) return 'exitBottom'
        if (dir < 0 && targetStep <= 0) return 'exitTop'
        return 'inside'
      }
      if (dir > 0 && y < g.top && g.top - y < ENTRY_BUFFER) return 'enterTop'
      if (dir < 0 && y > g.top + g.range && y - (g.top + g.range) < ENTRY_BUFFER)
        return 'enterBottom'
      return 'none'
    }

    function stepFrom(zone: Zone, dir: number, g: Geometry) {
      const next =
        zone === 'enterTop'
          ? 0
          : zone === 'enterBottom'
            ? STEP_COUNT - 1
            : clamp(targetStep + dir, 0, STEP_COUNT - 1)
      glideTo(next, g)
    }

    function onWheel(e: WheelEvent) {
      const g = getGeometry()
      if (!g) return
      const dir = Math.sign(e.deltaY)
      if (dir === 0) return
      const zone = zoneFor(dir, g)
      if (zone === 'none' || zone === 'exitTop' || zone === 'exitBottom') {
        // Laufenden Glide vor nativem Gegen-Scroll schützen, sonst nativ lassen
        if (isGliding) e.preventDefault()
        return
      }

      e.preventDefault()
      const now = performance.now()
      if (dir !== wheelDir || now - lastWheelAt > WHEEL_ACCUM_RESET_MS) wheelAccum = 0
      wheelDir = dir
      lastWheelAt = now
      wheelAccum += Math.abs(e.deltaY)

      if (isGliding) {
        // Richtungswechsel bricht den Glide ab und fährt sofort zurück
        if (dir === -glideDir && wheelAccum >= WHEEL_TRIGGER_DELTA) {
          cancelAnimationFrame(glideFrame)
          isGliding = false
          wheelAccum = 0
          stepFrom('inside', dir, g)
        }
        return
      }
      if (dir === lastGlideDir && now - glideEndAt < SAME_DIR_COOLDOWN_MS) return
      if (wheelAccum < WHEEL_TRIGGER_DELTA) return
      wheelAccum = 0
      stepFrom(zone, dir, g)
    }

    function onTouchStart(e: TouchEvent) {
      touchY = e.touches[0]?.clientY ?? null
      touchDone = false
    }

    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0]
      if (!touch || touchY === null) return
      if (isGliding) {
        // Geste festhalten, Baseline mitführen: nach dem Glide zählt sie neu
        e.preventDefault()
        touchY = touch.clientY
        return
      }
      const dy = touchY - touch.clientY
      const dir = Math.sign(dy)
      if (dir === 0) return
      const g = getGeometry()
      if (!g) return
      const zone = zoneFor(dir, g)
      if (zone === 'none' || zone === 'exitTop' || zone === 'exitBottom') {
        touchY = touch.clientY
        return
      }
      e.preventDefault()
      if (touchDone || Math.abs(dy) < TOUCH_TRIGGER_DELTA) return
      touchDone = true
      stepFrom(zone, dir, g)
    }

    function onTouchEnd() {
      touchY = null
      touchDone = false
    }

    render()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      stopSettlePoll()
      cancelAnimationFrame(scrollFrame)
      cancelAnimationFrame(glideFrame)
    }
  }, [])

  const active = Math.round(progress)

  return (
    <section className="bg-surface border-border border-t">
      {/* Hoher Track: 100svh Scrollweg pro Schritt, darin klebt der Viewport */}
      <div ref={trackRef} className="relative h-[500svh]">
        {/* h-dvh statt svh: füllt den echten sichtbaren Viewport, auch wenn
            die mobile URL-Leiste einklappt, sonst bleibt unten Leerraum */}
        <div className="sticky top-0 h-dvh overflow-hidden">
          {STEPS.map((step, index) => {
            // Abstand zum Fortschritt: 0 = voll sichtbar, ±1 = ausgeblendet,
            // der Glide zieht diese Werte weich durch (der feine Fade-Effekt)
            const distance = progress - index
            const opacity = clamp(1 - Math.abs(distance) * 1.4, 0, 1)
            const translateY = distance * -70
            return (
              <div
                key={step.title}
                aria-hidden={index !== active ? 'true' : 'false'}
                // Scroll-getriebene Werte müssen inline gesetzt werden,
                // sie ändern sich mit jedem Frame
                style={{ opacity, transform: `translateY(${translateY}px)` }}
                // top-16 = Header-Höhe: der Content zentriert sich im Bereich
                // UNTER der Navbar, dadurch beginnt jeder Schritt auf gleicher
                // Höhe und sitzt optisch mittig statt zu tief
                className={cn(
                  'absolute inset-x-0 top-16 bottom-0 flex items-center will-change-[opacity,transform]',
                  opacity === 0 && 'invisible',
                  index !== active && 'pointer-events-none'
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
                    {/* UI-Mock ist rein dekorativ, Screenreader lesen nur den Text */}
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
          Kostenlos und ohne Passwort:{' '}
          <Link href="/login" className="text-accent hover:underline">
            mit E-Mail-Code anmelden
          </Link>{' '}
          und loslegen.
        </p>
      </Container>
    </section>
  )
}
