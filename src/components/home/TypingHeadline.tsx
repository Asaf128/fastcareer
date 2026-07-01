'use client'

import { useEffect, useState } from 'react'

const HEADLINE = 'Finde deinen nächsten Job'
const SUBLINE =
  'Fastcareer durchsucht offene Stellen der Arbeitsagentur nach Beruf und Ort — schnell, übersichtlich, ohne Umwege.'

export function TypingHeadline() {
  const [typedLength, setTypedLength] = useState(0)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const step = prefersReducedMotion ? SUBLINE.length : 1

    let index = 0
    const interval = setInterval(() => {
      index += step
      setTypedLength(Math.min(index, SUBLINE.length))
      if (index >= SUBLINE.length) clearInterval(interval)
    }, 32)

    return () => clearInterval(interval)
  }, [])

  const typedSubline = SUBLINE.slice(0, typedLength)
  const isDone = typedLength >= SUBLINE.length

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-foreground text-3xl sm:text-4xl lg:text-5xl">{HEADLINE}</h1>
      <p className="text-text-secondary mt-3 text-base">
        <span aria-hidden="true">{typedSubline}</span>
        <span className="sr-only">{SUBLINE}</span>
        {!isDone && (
          <span aria-hidden="true" className="animate-pulse">
            |
          </span>
        )}
      </p>
    </div>
  )
}
