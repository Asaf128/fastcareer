import type { Metadata } from 'next'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

export const metadata: Metadata = {
  title: 'AGB',
  description:
    'Allgemeine Geschäftsbedingungen für den Kauf von KI-Credits auf Fastcareer, inklusive Widerrufsbelehrung.',
  robots: { index: true, follow: true },
}

export default function AgbPage() {
  return (
    <main>
      <Section className="py-10 lg:py-14">
        <Container className="max-w-3xl">
          <h1 className="text-foreground text-2xl lg:text-3xl">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>

          <div className="text-text-primary mt-8 space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="mb-2 font-medium">1. Geltungsbereich und Anbieter</h2>
              <p>
                Diese AGB gelten für den Kauf von KI-Credits über die Website Fastcareer. Anbieter
                ist Asaf Cebeci, Seiboldsdorfer Feld 5, 83278 Traunstein, E-Mail: ceb.asaf@gmail.com
                (nachfolgend „Anbieter&quot;). Die Jobsuche selbst sowie das Gratis-Kontingent der
                KI-Funktionen (alle 7 Tage) bleiben kostenlos; diese AGB betreffen nur den Kauf von
                Credit-Paketen.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">2. Leistung: Credit-Pakete</h2>
              <p>
                Ein Credit-Paket schaltet ein Nutzungskontingent für die KI-Funktionen frei. Die
                Paketgröße gilt je Funktionsart: Ein 100er-Paket umfasst 100 KI-Zusammenfassungen,
                100 Match-Berechnungen und 100 KI-Anschreiben. Für dieselbe Stellenanzeige wird pro
                Funktion nur einmal ein Credit verbraucht; erneutes Öffnen oder Neu-Generieren
                derselben Anzeige ist kostenfrei. Credits sind an das Nutzerkonto gebunden, nicht
                übertragbar und verfallen nicht. Das Gratis-Kontingent wird stets vor den gekauften
                Credits verbraucht. Schlägt eine KI-Generierung fehl, wird der Credit automatisch
                erstattet.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">3. Vertragsschluss und Bezahlung</h2>
              <p>
                Der Kauf erfolgt über den Zahlungsdienstleister Stripe. Mit Abschluss des
                Bezahlvorgangs („Kaufen&quot;-Button im Stripe-Checkout) kommt der Vertrag zustande.
                Die Gutschrift der Credits erfolgt unmittelbar nach Zahlungsbestätigung, in der
                Regel innerhalb weniger Sekunden. Eine Zahlungsbestätigung bzw. Rechnung erhältst du
                per E-Mail. Alle angegebenen Preise sind Endpreise in Euro.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">4. Widerrufsbelehrung</h2>
              <p>
                Verbrauchern steht grundsätzlich ein 14-tägiges Widerrufsrecht zu. Bei Verträgen
                über die Lieferung digitaler Inhalte, die nicht auf einem körperlichen Datenträger
                geliefert werden, erlischt das Widerrufsrecht gemäß § 356 Abs. 5 BGB, wenn der
                Anbieter mit der Ausführung des Vertrags begonnen hat, nachdem du ausdrücklich
                zugestimmt hast, dass mit der Ausführung vor Ablauf der Widerrufsfrist begonnen
                wird, und du deine Kenntnis davon bestätigt hast, dass durch diese Zustimmung dein
                Widerrufsrecht erlischt.
              </p>
              <p className="mt-2">
                Diese Zustimmung gibst du beim Kauf im Bezahlvorgang ab: Die Credits werden dir
                unmittelbar nach der Zahlung bereitgestellt, damit erlischt dein Widerrufsrecht.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">5. Verfügbarkeit und KI-Ergebnisse</h2>
              <p>
                Die KI-Funktionen werden mit hoher, aber nicht garantierter Verfügbarkeit
                bereitgestellt. KI-generierte Inhalte (Zusammenfassungen, Match-Bewertungen,
                Anschreiben) werden automatisiert erstellt und können Fehler enthalten. Bitte prüfe
                insbesondere Anschreiben vor dem Versand. Eine Garantie für den Erfolg von
                Bewerbungen wird nicht übernommen.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">6. Kontolöschung</h2>
              <p>
                Du kannst dein Konto jederzeit in den Profileinstellungen löschen. Mit der Löschung
                verfallen nicht genutzte Credits ersatzlos; eine Auszahlung oder Erstattung erfolgt
                nicht.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">7. Haftung</h2>
              <p>
                Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie nach dem
                Produkthaftungsgesetz. Bei leichter Fahrlässigkeit haftet der Anbieter nur für
                Schäden aus der Verletzung wesentlicher Vertragspflichten, begrenzt auf den
                vertragstypischen, vorhersehbaren Schaden.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">8. Schlussbestimmungen</h2>
              <p>
                Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Sollten einzelne
                Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen
                Bestimmungen unberührt. Die EU-Kommission stellt eine Plattform zur
                Online-Streitbeilegung bereit (https://ec.europa.eu/consumers/odr). Der Anbieter ist
                nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </div>
        </Container>
      </Section>
    </main>
  )
}
