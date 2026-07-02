'use client'

import { useEffect, useRef } from 'react'

interface PopularSearchesCarouselProps {
  searches: string[]
  onSelect: (suche: string) => void
}

const SPEED_PX_PER_SECOND = 28
const DRAG_CLICK_THRESHOLD = 6
// Genug Kopien, dass eine Listen-Periode auch auf breiten Containern nie
// ausläuft — sonst sieht man am Zyklusende den Neustart
const COPIES = 4
// Muss zur gap-2 (0.5rem) des Tracks passen
const GAP_PX = 8

function wrap(value: number, width: number) {
  if (width <= 0) return value
  const remainder = value % width
  return remainder > 0 ? remainder - width : remainder
}

export function PopularSearchesCarousel({ searches, onSelect }: PopularSearchesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const trackWidthRef = useRef(0)
  const isPausedRef = useRef(false)
  const dragRef = useRef<{ startX: number; startOffset: number; moved: boolean } | null>(null)

  useEffect(() => {
    if (trackRef.current) {
      // Exakte Periode einer Listen-Kopie inkl. Gap: scrollWidth enthält
      // (COPIES*N - 1) Gaps, eine Periode aber N Gaps — ohne die Korrektur
      // driftet der Loop pro Umlauf um eine Gap-Breite und man sieht die Naht
      trackWidthRef.current = (trackRef.current.scrollWidth + GAP_PX) / COPIES
    }
  }, [searches])

  useEffect(() => {
    let frame: number
    let lastTime: number | null = null

    function tick(time: number) {
      if (lastTime === null) lastTime = time
      const delta = (time - lastTime) / 1000
      lastTime = time

      if (!isPausedRef.current && trackWidthRef.current > 0) {
        offsetRef.current = wrap(
          offsetRef.current - SPEED_PX_PER_SECOND * delta,
          trackWidthRef.current
        )
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${offsetRef.current}px)`
        }
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    isPausedRef.current = true
    dragRef.current = { startX: e.clientX, startOffset: offsetRef.current, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const delta = e.clientX - dragRef.current.startX
    if (Math.abs(delta) > DRAG_CLICK_THRESHOLD) dragRef.current.moved = true

    offsetRef.current = wrap(dragRef.current.startOffset + delta, trackWidthRef.current)
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${offsetRef.current}px)`
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current && !dragRef.current.moved) {
      // setPointerCapture re-targets subsequent events to the container, so
      // the button's own onClick doesn't reliably fire — resolve the actual
      // element under the pointer instead.
      const hit = document.elementFromPoint(e.clientX, e.clientY)
      const suche = hit?.closest('button')?.dataset.suche
      if (suche) onSelect(suche)
    }
    dragRef.current = null
    isPausedRef.current = false
  }

  // Browser bricht die Geste ab (z. B. vertikales Scrollen auf Touch) —
  // ohne Reset bliebe das Karussell dauerhaft pausiert stehen
  function handlePointerCancel() {
    dragRef.current = null
    isPausedRef.current = false
  }

  return (
    <div className="mt-5">
      <p className="text-text-secondary mb-2 text-center text-sm">Beliebte Suchen:</p>
      {/* touch-action: pan-y statt none — die Seite bleibt vertikal
          scrollbar, nur horizontale Gesten steuern das Karussell */}
      <div
        className="w-full min-w-0 cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
      >
        <div ref={trackRef} className="flex w-max gap-2 will-change-transform">
          {Array.from({ length: COPIES }, () => searches)
            .flat()
            .map((suche, index) => (
              <button
                key={`${suche}-${index}`}
                type="button"
                data-suche={suche}
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
