import Link from 'next/link'
import { ClipboardList, FileText, Sparkles } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'KI-Zusammenfassung',
    text: 'Statt langer Stellenbeschreibungen siehst du auf einen Blick: Aufgaben, Anforderungen und Benefits — von unserer KI in Sekunden zusammengefasst.',
  },
  {
    icon: FileText,
    title: 'Anschreiben auf Knopfdruck',
    text: 'Lade deinen Lebenslauf hoch und erhalte für jede Stelle ein maßgeschneidertes Anschreiben — bereit zum Anpassen, Herunterladen und Abschicken.',
  },
  {
    icon: ClipboardList,
    title: 'Bewerbungs-Cockpit',
    text: 'Behalte den Überblick: Von "Gespeichert" über "Interview" bis zur Zusage — verfolge jeden Bewerbungsstand mit Notizen an einem Ort.',
  },
] as const

export function FeatureSection() {
  return (
    <Section className="border-border border-t py-16 lg:py-24">
      <Container>
        <h2 className="text-foreground text-center text-2xl lg:text-3xl">Mehr als eine Jobsuche</h2>
        <p className="text-text-secondary mx-auto mt-2 max-w-xl text-center text-sm">
          Fastcareer durchsucht die offiziellen Stellen der Bundesagentur für Arbeit — und nimmt dir
          mit KI die mühsamen Teile der Bewerbung ab.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="border-border bg-background rounded-xl border p-6 shadow-sm"
            >
              <feature.icon className="text-accent h-6 w-6" />
              <h3 className="text-foreground mt-3 text-base font-semibold">{feature.title}</h3>
              <p className="text-text-secondary mt-2 text-sm leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>

        <p className="text-text-secondary mt-8 text-center text-sm">
          Kostenlos und ohne Passwort —{' '}
          <Link href="/login" className="text-accent hover:underline">
            mit E-Mail-Code anmelden
          </Link>{' '}
          und loslegen.
        </p>
      </Container>
    </Section>
  )
}
