'use client'

import { useEffect, useRef } from 'react'

interface PopularSearchesCarouselProps {
  searches: string[]
  onSelect: (suche: string) => void
}

const SPEED_PX_PER_SECOND = 28
const DRAG_CLICK_THRESHOLD = 6

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
      trackWidthRef.current = trackRef.current.scrollWidth / 2
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
  }

  return (
    <div className="mt-5">
      <p className="text-text-secondary mb-2 text-center text-sm">Beliebte Suchen:</p>
      <div
        className="w-full min-w-0 cursor-grab overflow-hidden active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div ref={trackRef} className="flex w-max gap-2 will-change-transform">
          {[...searches, ...searches].map((suche, index) => (
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
