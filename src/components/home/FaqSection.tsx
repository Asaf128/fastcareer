import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

const FAQS = [
  {
    frage: 'Ist Fastcareer kostenlos?',
    antwort:
      'Die Jobsuche ist immer kostenlos und funktioniert ohne Konto. Für KI-Anschreiben und das Bewerbungs-Cockpit meldest du dich per E-Mail-Code an, ohne Passwort. Die KI-Funktionen (Zusammenfassung, Match-Score, Anschreiben) sind pro Tag 3 Mal gratis nutzbar, danach kannst du günstige Credits dazukaufen.',
  },
  {
    frage: 'Woher kommen die Stellenangebote?',
    antwort:
      'Alle Stellenangebote stammen aus der offiziellen Jobbörse der Bundesagentur für Arbeit, der größten Stellendatenbank Deutschlands mit Hunderttausenden aktuellen Angeboten.',
  },
  {
    frage: 'Wie funktioniert das KI-Anschreiben?',
    antwort:
      'Du lädst einmalig deinen Lebenslauf hoch (oder füllst dein Profil aus). Für jede Stelle erstellt die KI daraus ein individuelles Anschreiben, das sich auf die konkreten Anforderungen bezieht. Du kannst es bearbeiten, als PDF herunterladen oder direkt per E-Mail verschicken.',
  },
  {
    frage: 'Was passiert mit meinen Daten?',
    antwort:
      'Deine Daten gehören dir: Profil und Lebenslauf sind nur für dich zugänglich, werden ausschließlich für deine Bewerbungen genutzt und lassen sich jederzeit mitsamt Konto vollständig löschen.',
  },
  {
    frage: 'Muss ich mich bei der Arbeitsagentur bewerben?',
    antwort:
      'Nein. Fastcareer zeigt dir die Kontaktdaten bzw. den Original-Link jeder Stelle. Du bewirbst dich direkt beim Arbeitgeber, mit deinem fertigen Anschreiben.',
  },
] as const

export function FaqSection() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.frage,
      acceptedAnswer: { '@type': 'Answer', text: faq.antwort },
    })),
  }

  return (
    <Section className="border-border flex min-h-svh flex-col justify-center border-t py-16 lg:py-24">
      <Container className="max-w-3xl">
        <h2 className="text-foreground text-center text-2xl lg:text-3xl">Häufige Fragen</h2>

        <div className="mt-8 space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.frage}
              className="border-border bg-background group rounded-xl border p-5 shadow-sm"
            >
              <summary className="text-foreground cursor-pointer list-none text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {faq.frage}
                  <span
                    aria-hidden="true"
                    className="text-text-secondary text-lg transition-transform duration-150 group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="text-text-secondary mt-3 text-sm leading-relaxed">{faq.antwort}</p>
            </details>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Container>
    </Section>
  )
}
