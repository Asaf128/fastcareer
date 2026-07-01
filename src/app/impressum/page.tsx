import type { Metadata } from 'next'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

export const metadata: Metadata = {
  title: 'Impressum',
  description: 'Anbieterkennzeichnung gemäß § 5 TMG.',
  robots: { index: true, follow: true },
}

export default function ImpressumPage() {
  return (
    <main>
      <Section className="pt-32">
        <Container className="max-w-3xl">
          <p className="text-text-secondary mb-4 text-xs tracking-[0.4em] uppercase">Rechtliches</p>
          <h1 className="text-foreground text-5xl lg:text-6xl">Impressum</h1>
          <div className="bg-accent mt-6 h-px w-16" />

          <div className="text-text-primary mt-12 space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="mb-2 font-medium">Angaben gemäß § 5 TMG</h2>
              <p>
                [DEIN VOR- UND NACHNAME]
                <br />
                [STRASSE UND HAUSNUMMER]
                <br />
                [PLZ UND ORT]
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">Kontakt</h2>
              <p>
                E-Mail: [DEINE-EMAIL@BEISPIEL.DE]
                <br />
                Telefon: [OPTIONAL]
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
              </h2>
              <p>
                [DEIN VOR- UND NACHNAME]
                <br />
                [STRASSE UND HAUSNUMMER]
                <br />
                [PLZ UND ORT]
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-medium">EU-Streitschlichtung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
                bereit:{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                . Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor
                einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </div>
        </Container>
      </Section>
    </main>
  )
}
