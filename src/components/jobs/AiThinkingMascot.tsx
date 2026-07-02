'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

interface AiThinkingMascotProps {
  phase: 'thinking' | 'done'
}

const THOUGHTS = [
  'Lese dein Profil …',
  'Vergleiche mit der Stellenanzeige …',
  'Formuliere den Anschreiben-Text …',
  'Letzter Feinschliff …',
]

const THOUGHT_INTERVAL_MS = 1700

/**
 * Kleines Maskottchen, das während der KI-Generierung über dem
 * Anschreiben-Feld erscheint und in einer Sprechblase die aktuellen
 * "Gedanken" der KI zeigt — lockert die 20-30 Sekunden Wartezeit auf.
 */
export function AiThinkingMascot({ phase }: AiThinkingMascotProps) {
  const [thoughtIndex, setThoughtIndex] = useState(0)

  useEffect(() => {
    if (phase !== 'thinking') return
    const timer = setInterval(() => {
      setThoughtIndex((i) => (i + 1) % THOUGHTS.length)
    }, THOUGHT_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [phase])

  return (
    <div
      role="status"
      aria-label={phase === 'done' ? 'Anschreiben fertig' : 'Anschreiben wird erstellt'}
      className="relative z-10 flex justify-center"
    >
      <div className="relative -mb-7 flex flex-col items-center">
        <div className="border-border bg-background relative mb-1 rounded-2xl border px-4 py-2 shadow-md">
          <p
            key={phase === 'done' ? 'done' : thoughtIndex}
            className="text-foreground animate-fade-in text-sm font-medium whitespace-nowrap"
          >
            {phase === 'done' ? 'Fertig!' : THOUGHTS[thoughtIndex]}
          </p>
          <div className="border-border bg-background absolute -bottom-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-r border-b" />
        </div>

        {/* Freundliches Wesen in Accent-Farbe — bobt sanft, während die KI denkt */}
        <svg
          width="56"
          height="52"
          viewBox="0 0 56 52"
          fill="none"
          aria-hidden
          className={cn(phase === 'thinking' && 'animate-mascot-bob')}
        >
          <ellipse cx="28" cy="22" rx="22" ry="19" className="fill-accent" />
          <circle cx="20" cy="20" r="3.2" fill="#fff" />
          <circle cx="36" cy="20" r="3.2" fill="#fff" />
          <circle cx="20" cy="20.6" r="1.4" fill="#191919" />
          <circle cx="36" cy="20.6" r="1.4" fill="#191919" />
          <path
            d="M10 34c-2 4-2 9 1 12M18 38c-1 4 0 8 2 11M28 40v11M38 38c1 4 0 8-2 11M46 34c2 4 2 9-1 12"
            className="stroke-accent"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  )
}
