'use client'

import { useEffect, useState } from 'react'

const HEADLINE = 'Finde deinen nächsten Job'

export function TypingHeadline() {
  const [typedLength, setTypedLength] = useState(0)

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      index += 1
      setTypedLength(Math.min(index, HEADLINE.length))
      if (index >= HEADLINE.length) clearInterval(interval)
    }, 60)

    return () => clearInterval(interval)
  }, [])

  const typedHeadline = HEADLINE.slice(0, typedLength)
  const isDone = typedLength >= HEADLINE.length

  return (
    <h1 className="text-foreground mx-auto max-w-2xl text-center text-4xl sm:text-4xl lg:text-5xl">
      <span aria-hidden="true">{typedHeadline}</span>
      <span className="sr-only">{HEADLINE}</span>
      {!isDone && (
        <span aria-hidden="true" className="animate-pulse">
          |
        </span>
      )}
    </h1>
  )
}
