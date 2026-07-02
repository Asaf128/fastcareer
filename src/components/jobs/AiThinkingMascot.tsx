'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

interface AiThinkingMascotProps {
  phase: 'thinking' | 'done'
  titel: string
  arbeitgeber: string
}

const THOUGHT_INTERVAL_MS = 2000

// Pixel-Geist im Pac-Man-Stil: o = Accent-Orange, w = Augenweiß,
// b = Pupille, . = leer — bewusst verpixelt (crispEdges), warm und freundlich
const PIXEL_ROWS = [
  '....oooo....',
  '..oooooooo..',
  '.oooooooooo.',
  '.oowwoowwoo.',
  'ooowboowbooo',
  'oooooooooooo',
  'oooooooooooo',
  'oooooooooooo',
  'oooooooooooo',
  'oo.oo..oo.oo',
] as const
const PIXEL_SIZE = 4

const PIXEL_FILL: Record<string, string> = {
  o: 'fill-accent',
  w: 'fill-background',
  b: 'fill-foreground',
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max).trimEnd()}…` : value
}

/**
 * Gedanken-Pool aus den echten Daten der Stelle. Anfang und Ende erzählen
 * eine feste Mini-Geschichte, die Mitte wird pro Durchlauf gemischt — so
 * wiederholt sich nichts und jede Generierung liest sich anders.
 */
function buildThoughts(titel: string, arbeitgeber: string): string[] {
  const job = truncate(titel, 32)
  const firma = truncate(arbeitgeber, 28)
  const middle = [
    `Was verlangt "${job}" genau?`,
    `Was macht ${firma} eigentlich aus?`,
    'Suche Überschneidungen mit deinen Skills …',
    'Der erste Satz muss sitzen …',
    'Floskeln? Gestrichen.',
    'Hmm, das klingt noch steif …',
    'Besser. Viel besser.',
    'Hauptteil: deine Stärken …',
    'Nichts erfinden — nur was wirklich in deinem Profil steht.',
    'Formuliere die Einleitung um …',
    'Noch den Schluss abrunden …',
    'Kommas prüfen …',
    'Einmal gedanklich laut vorlesen …',
  ]
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[middle[i], middle[j]] = [middle[j]!, middle[i]!]
  }
  return ['Öffne dein Profil …', 'Lese deinen Werdegang …', ...middle, 'Feinschliff, fast fertig …']
}

/**
 * Kleines Pixel-Maskottchen, das während der KI-Generierung über dem
 * Anschreiben-Feld sitzt und in einer Sprechblase kurze Gedanken zeigt —
 * gespeist aus den echten Stellen-Daten, ohne sich zu wiederholen.
 */
export function AiThinkingMascot({ phase, titel, arbeitgeber }: AiThinkingMascotProps) {
  const [thoughts] = useState(() => buildThoughts(titel, arbeitgeber))
  const [thoughtIndex, setThoughtIndex] = useState(0)

  useEffect(() => {
    if (phase !== 'thinking') return
    const timer = setInterval(() => {
      // Beim letzten Gedanken stehen bleiben statt von vorn zu beginnen
      setThoughtIndex((i) => Math.min(i + 1, thoughts.length - 1))
    }, THOUGHT_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [phase, thoughts.length])

  return (
    <div
      role="status"
      aria-label={phase === 'done' ? 'Anschreiben fertig' : 'Anschreiben wird erstellt'}
      className="relative z-10 flex justify-center"
    >
      <div className="relative -mb-7 flex flex-col items-center">
        {/* Feste Breite + Höhe: die Blase darf beim Gedankenwechsel nicht
            wachsen/schrumpfen, sonst wirkt es wie ein Neuladen */}
        <div className="border-border bg-background relative mb-1.5 flex h-14 w-72 items-center justify-center rounded-2xl border px-4 shadow-md">
          <p
            key={phase === 'done' ? 'done' : thoughtIndex}
            className="text-foreground animate-thought-fade text-center text-sm font-medium"
          >
            {phase === 'done' ? 'Fertig!' : thoughts[thoughtIndex]}
          </p>
          <div className="border-border bg-background absolute -bottom-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-r border-b" />
        </div>

        <svg
          width={12 * PIXEL_SIZE}
          height={PIXEL_ROWS.length * PIXEL_SIZE}
          viewBox={`0 0 ${12 * PIXEL_SIZE} ${PIXEL_ROWS.length * PIXEL_SIZE}`}
          shapeRendering="crispEdges"
          aria-hidden
          className={cn(phase === 'thinking' && 'animate-mascot-bob')}
        >
          {PIXEL_ROWS.flatMap((row, y) =>
            row
              .split('')
              .map((pixel, x) =>
                pixel === '.' ? null : (
                  <rect
                    key={`${x}-${y}`}
                    x={x * PIXEL_SIZE}
                    y={y * PIXEL_SIZE}
                    width={PIXEL_SIZE}
                    height={PIXEL_SIZE}
                    className={PIXEL_FILL[pixel]}
                  />
                )
              )
          )}
        </svg>
      </div>
    </div>
  )
}
