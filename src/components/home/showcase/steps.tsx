import {
  BoardVisual,
  LetterVisual,
  PdfVisual,
  SearchVisual,
  SummaryVisual,
} from '@/components/home/showcase/visuals'

/** Inhalte der Scroll-Experience: Titel, Beschreibung und UI-Mock pro Schritt. */
export const SHOWCASE_STEPS = [
  {
    title: 'Finde deinen Job',
    text: 'Fastcareer durchsucht die offiziellen Stellen der Bundesagentur für Arbeit nach Beruf, Ort und Arbeitszeit, mit Vorschlägen schon beim Tippen.',
    visual: <SearchVisual />,
  },
  {
    title: 'Verstehe die Stelle in Sekunden',
    text: 'Statt langer Anzeigentexte fasst die KI das Wesentliche zusammen: Aufgaben, Anforderungen, Benefits und wie gut die Stelle zu deinem Profil passt.',
    visual: <SummaryVisual />,
  },
  {
    title: 'Anschreiben auf Knopfdruck',
    text: 'Aus deinem Profil und den Anforderungen der Stelle entsteht ein maßgeschneidertes Anschreiben, bereit zum Anpassen in deinem Ton.',
    visual: <LetterVisual />,
  },
  {
    title: 'Fertig als PDF-Brief',
    text: 'Betreff, Datum und Anschrift kontrollierst du selbst, dann lädst du dein Anschreiben im DIN-Briefformat herunter oder bewirbst dich direkt per E-Mail.',
    visual: <PdfVisual />,
  },
  {
    title: 'Behalte den Überblick',
    text: 'Von "Gespeichert" über "Interview" bis zur Zusage: Verfolge jeden Bewerbungsstand mit Notizen und Checkliste an einem Ort.',
    visual: <BoardVisual />,
  },
] as const
