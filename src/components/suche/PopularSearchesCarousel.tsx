'use client'

import { useEffect, useRef } from 'react'

interface PopularSearchesCarouselProps {
  searches: string[]
  onSelect: (suche: string) => void
}

const SPEED_PX_PER_SECOND = 28
const DRAG_CLICK_THRESHOLD = 6
// Nach Touch-Interaktion so lange warten, bevor die Auto-Rotation weiterläuft
const RESUME_DELAY_MS = 1500
// Genug Kopien, dass eine Listen-Periode auch auf breiten Containern nie
// ausläuft, sonst sieht man am Zyklusende den Neustart
const COPIES = 4
// Muss zur gap-2 (0.5rem) des Tracks passen
const GAP_PX = 8

/**
 * Endlos rotierendes Chip-Karussell auf Basis eines NATIVEN Scroll-Containers:
 * Touch-Ziehen, Momentum und Tippen laufen über das Browser-Scrolling (damit
 * funktioniert es zuverlässig auf iOS), die Auto-Rotation schreibt scrollLeft.
 * Der Endlos-Loop hält die Scroll-Position unsichtbar in der mittleren Kopie.
 */
export function PopularSearchesCarousel({ searches, onSelect }: PopularSearchesCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const periodRef = useRef(0)
  // Float-Position: scrollLeft rundet auf ganze Pixel, bei 28 px/s wären das
  // <1 px pro Frame und die Rotation käme nie in Gang
  const positionRef = useRef(0)
  const pausedUntilRef = useRef(0)
  const dragRef = useRef<{ startX: number; startScroll: number; moved: boolean } | null>(null)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    // Periode einer Listen-Kopie inkl. Gap (scrollWidth enthält eine Gap weniger)
    periodRef.current = (el.scrollWidth + GAP_PX) / COPIES
    positionRef.current = periodRef.current
    el.scrollLeft = periodRef.current
  }, [searches])

  useEffect(() => {
    let frame: number
    let lastTime: number | null = null

    function tick(time: number) {
      if (lastTime === null) lastTime = time
      const delta = (time - lastTime) / 1000
      lastTime = time

      const el = scrollerRef.current
      if (
        el &&
        periodRef.current > 0 &&
        !dragRef.current &&
        performance.now() >= pausedUntilRef.current
      ) {
        positionRef.current += SPEED_PX_PER_SECOND * delta
        el.scrollLeft = positionRef.current
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Endlos-Loop: Position unsichtbar in der Mitte halten; externe Scrolls
  // (Touch/Trackpad) in die Float-Position übernehmen
  function handleScroll() {
    const el = scrollerRef.current
    const period = periodRef.current
    if (!el || period <= 0) return

    if (Math.abs(el.scrollLeft - positionRef.current) > 1.5) {
      positionRef.current = el.scrollLeft
    }
    if (positionRef.current < period * 0.5) {
      positionRef.current += period
      el.scrollLeft = positionRef.current
    } else if (positionRef.current > period * 2.5) {
      positionRef.current -= period
      el.scrollLeft = positionRef.current
    }
  }

  function pauseAutoRotation() {
    pausedUntilRef.current = performance.now() + RESUME_DELAY_MS
  }

  // Maus-Ziehen auf Desktop, Touch läuft komplett über das native Scrolling
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') {
      pauseAutoRotation()
      return
    }
    const el = scrollerRef.current
    if (!el) return
    dragRef.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const el = scrollerRef.current
    if (!el) return
    const delta = e.clientX - dragRef.current.startX
    if (Math.abs(delta) > DRAG_CLICK_THRESHOLD) dragRef.current.moved = true
    el.scrollLeft = dragRef.current.startScroll - delta
    positionRef.current = el.scrollLeft
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') {
      pauseAutoRotation()
      return
    }
    if (dragRef.current && !dragRef.current.moved) {
      // setPointerCapture re-targets subsequent events to the container, so
      // the button's own onClick doesn't reliably fire: resolve the actual
      // element under the pointer instead.
      const hit = document.elementFromPoint(e.clientX, e.clientY)
      const suche = hit?.closest('button')?.dataset.suche
      if (suche) onSelect(suche)
    }
    dragRef.current = null
  }

  function handlePointerCancel() {
    dragRef.current = null
    pauseAutoRotation()
  }

  function handleChipClick(e: React.MouseEvent<HTMLButtonElement>, suche: string) {
    // Maus-Klicks landen wegen Pointer-Capture bereits im handlePointerUp,
    // hier greifen Touch-Taps (natives Scrolling unterdrückt Klicks beim
    // Ziehen von selbst) und Tastatur (detail === 0)
    const pointerType = (e.nativeEvent as PointerEvent).pointerType as string | undefined
    if (pointerType === 'mouse') return
    onSelect(suche)
  }

  return (
    <div className="mt-5">
      <p className="text-text-secondary mb-2 text-center text-sm">Beliebte Suchen:</p>
      <div
        ref={scrollerRef}
        className="w-full min-w-0 cursor-grab [scrollbar-width:none] overflow-x-auto select-none active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className="flex w-max gap-2">
          {Array.from({ length: COPIES }, () => searches)
            .flat()
            .map((suche, index) => (
              <button
                key={`${suche}-${index}`}
                type="button"
                data-suche={suche}
                onClick={(e) => handleChipClick(e, suche)}
                className="border-border text-text-secondary hover:border-accent hover:text-accent shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors duration-150"
              >
                {suche}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
