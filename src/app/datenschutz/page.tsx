import type { Metadata } from 'next'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description: 'Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.',
  robots: { index: true, follow: true },
}

export default function DatenschutzPage() {
  return (
    <main>
      <Section className="py-10 lg:py-14">
        <Container className="max-w-3xl">
          <h1 className="text-foreground text-2xl lg:text-3xl">Datenschutzerklärung</h1>

          <div className="text-text-primary mt-8 space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="mb-2 font-medium">1. Verantwortlicher</h2>
              <p>
                Asaf Cebeci
                <br />
                Seiboldsdorfer Feld 5
                <br />
                83278 Traunstein
                <br />
                E-Mail: ceb.asaf@gmail.com
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">2. Hosting (Vercel)</h2>
              <p>
                Diese Website wird bei Vercel Inc. gehostet. Beim Aufruf der Seite verarbeitet
                Vercel automatisch technische Daten (u. a. IP-Adresse, Zeitstempel, aufgerufene
                Seite) in Form von Server-Logs, um die Auslieferung der Seite technisch zu
                ermöglichen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
                an einem sicheren und funktionsfähigen Betrieb).
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">3. Vercel Analytics &amp; Speed Insights</h2>
              <p>
                Wir nutzen Vercel Analytics und Vercel Speed Insights zur anonymisierten,
                aggregierten Auswertung von Seitenaufrufen und Ladezeiten. Beide Dienste arbeiten
                cookielos und ohne Wiedererkennung einzelner Nutzer über mehrere Sitzungen hinweg,
                daher ist keine Einwilligung nach § 25 TTDSG erforderlich. Rechtsgrundlage ist Art.
                6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Analyse und Optimierung des
                Angebots).
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">4. Jobsuche-Funktion</h2>
              <p>
                Bei Nutzung der Jobsuche werden die eingegebenen Suchbegriffe serverseitig an die
                offene Schnittstelle der Bundesagentur für Arbeit weitergeleitet, um passende
                Stellenangebote abzurufen. Für Ortsvorschläge wird serverseitig die Schnittstelle
                von openplz.de abgefragt. In beiden Fällen erfolgt die Abfrage über unseren Server —
                es besteht keine direkte Verbindung zwischen deinem Browser und diesen Diensten. Es
                werden keine Suchanfragen dauerhaft gespeichert oder Profilen zugeordnet.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">5. Nutzerkonto &amp; Merkliste (Supabase)</h2>
              <p>
                Für die Anmeldung und die Merkliste nutzen wir Supabase als Backend-Infrastruktur.
                Bei der Anmeldung per E-Mail-Code verarbeiten wir deine E-Mail-Adresse, um dir einen
                Anmelde-Code zuzusenden und dein Konto zu erstellen bzw. wiederzuerkennen. Merkst du
                dir ein Stellenangebot, speichern wir die Referenznummer, den Titel und den
                Arbeitgeber der Stelle, verknüpft mit deinem Konto, damit du sie in deiner Merkliste
                wiederfindest. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Erfüllung des
                Nutzungsvertrags). Diese Daten werden gelöscht, wenn du dein Konto löschen lässt
                oder einzelne Einträge aus deiner Merkliste entfernst. Der Zugriff auf deine Daten
                ist technisch (Row Level Security) auf dein eigenes Konto beschränkt.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">6. Schriftarten (Google Fonts)</h2>
              <p>
                Die verwendeten Schriftarten werden über <code>next/font</code> beim Build in die
                Website eingebunden und lokal von unserem Server ausgeliefert. Beim Aufruf der Seite
                findet keine Verbindung zu Google-Servern statt, es werden keine Daten an Google
                übertragen.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">7. Deine Rechte</h2>
              <p>
                Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
                Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung deiner
                personenbezogenen Daten (Art. 15–21 DSGVO). Wende dich dazu an die oben genannte
                Kontaktadresse. Außerdem steht dir ein Beschwerderecht bei einer
                Datenschutzaufsichtsbehörde zu.
              </p>
            </section>
          </div>
        </Container>
      </Section>
    </main>
  )
}
