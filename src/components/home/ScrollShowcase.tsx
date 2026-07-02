import Link from 'next/link'
import { Container } from '@/components/shared/Container'
import { ShowcaseStep } from '@/components/home/showcase/ShowcaseStep'
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
 * Scroll-Experience zwischen Suche und FAQ: stellt die Funktionen der
 * Plattform Schritt für Schritt vor, während die Abschnitte beim Scrollen
 * sanft einblenden.
 */
export function ScrollShowcase() {
  return (
    <section className="bg-surface-dark overflow-hidden">
      <Container className="py-20 lg:py-28">
        <p className="text-accent text-center text-sm font-semibold tracking-widest uppercase">
          So funktioniert&apos;s
        </p>
        <h2 className="text-text-on-dark mt-3 text-center text-3xl lg:text-4xl">
          Von der Suche zur Bewerbung
        </h2>
        <p className="text-text-on-dark-muted mx-auto mt-3 max-w-xl text-center text-sm lg:text-base">
          Fastcareer nimmt dir die mühsamen Teile der Bewerbung ab — in fünf Schritten vom
          Stellenangebot zum fertigen Anschreiben.
        </p>

        {STEPS.map((step, index) => (
          <ShowcaseStep
            key={step.title}
            step={index + 1}
            title={step.title}
            text={step.text}
            reverse={index % 2 === 1}
          >
            {step.visual}
          </ShowcaseStep>
        ))}

        <p className="text-text-on-dark-muted mt-4 text-center text-sm">
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
