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

/**
 * Pinned-Scroll-Experience (DJI-Stil): Die Sektion bleibt beim Scrollen im
 * Viewport stehen, während die Schritte nacheinander von unten einfaden und
 * nach oben wieder verschwinden. Opacity und Position hängen kontinuierlich
 * am Scroll-Fortschritt (kein diskretes Umschalten mit Transition) — dadurch
 * folgt die Animation dem Finger/Mausrad framegenau statt zu "hängen".
 */
export function ScrollShowcase() {
  const trackRef = useRef<HTMLDivElement>(null)
  // Kontinuierlicher Fortschritt 0 … STEPS.length-1
  const [raw, setRaw] = useState(0)

  useEffect(() => {
    let frame = 0

    function update() {
      frame = 0
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const range = rect.height - window.innerHeight
      if (range <= 0) return
      const progress = Math.min(1, Math.max(0, -rect.top / range))
      setRaw(progress * (STEPS.length - 1))
    }

    function onScroll() {
      if (frame === 0) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [])

  const active = Math.round(raw)

  return (
    <section className="bg-surface border-border border-t">
      {/* Hoher Track: 100svh Scrollweg pro Schritt, darin klebt der Viewport */}
      <div ref={trackRef} className="relative h-[500svh]">
        <div className="sticky top-0 flex h-svh items-center overflow-hidden">
          {STEPS.map((step, index) => {
            // Abstand zum aktiven Punkt: 0 = voll sichtbar, ±1 = ausgeblendet
            const distance = raw - index
            const opacity = Math.min(1, Math.max(0, 1 - Math.abs(distance) * 1.4))
            const translateY = distance * -70
            return (
              <div
                key={step.title}
                aria-hidden={index !== active ? 'true' : 'false'}
                // Scroll-getriebene Werte müssen inline gesetzt werden —
                // sie ändern sich mit jedem Frame
                style={{ opacity, transform: `translateY(${translateY}px)` }}
                className={cn(
                  'absolute inset-0 flex items-center will-change-[opacity,transform]',
                  opacity === 0 && 'invisible',
                  index !== active && 'pointer-events-none'
                )}
              >
                <Container className="w-full">
                  <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                    <div className={cn(index % 2 === 1 && 'lg:order-2')}>
                      <span className="text-accent font-display text-sm font-semibold tracking-widest">
                        {String(index + 1).padStart(2, '0')} /{' '}
                        {String(STEPS.length).padStart(2, '0')}
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
