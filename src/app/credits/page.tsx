import type { Metadata } from 'next'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { PackageCard } from '@/components/credits/PackageCard'
import { CREDIT_PACKAGES } from '@/constants/creditPackages'
import { getCreditBalance } from '@/lib/credits'
import { getAuthUser } from '@/lib/supabase/server'
import { USAGE_LIMIT } from '@/lib/usage'

export const metadata: Metadata = {
  title: 'Credits kaufen',
  description:
    'KI-Credits für deine Jobsuche: Zusammenfassungen, Match-Berechnungen und Anschreiben. Einmalig kaufen, kein Abo, Credits verfallen nicht.',
}

export default async function CreditsPage() {
  const user = await getAuthUser()
  const balance = user ? await getCreditBalance() : null

  return (
    <Section className="py-10 lg:py-14">
      <Container className="max-w-3xl">
        <h1 className="text-foreground text-2xl lg:text-3xl">Credits kaufen</h1>
        <p className="text-text-secondary mt-2 max-w-xl text-sm lg:text-base">
          {USAGE_LIMIT} Nutzungen pro KI-Feature sind alle 7 Tage kostenlos. Wer mehr braucht, kauft
          einmalig ein Paket, kein Abo, keine Folgekosten, Credits verfallen nicht.
        </p>

        {balance && (
          <div className="border-border bg-surface mt-6 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border p-4 text-sm">
            <span className="text-foreground font-medium">Dein Guthaben:</span>
            <span className="text-text-primary">{balance.summary} Zusammenfassungen</span>
            <span className="text-text-primary">{balance.match} Matches</span>
            <span className="text-text-primary">{balance.letter} Anschreiben</span>
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {CREDIT_PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} isAuthenticated={Boolean(user)} />
          ))}
        </div>

        <div className="text-text-secondary mt-8 space-y-2 text-xs leading-relaxed">
          <p>
            Ein Paket gilt pro Feature-Typ: Das Jobsuche-Paket sind 30 Zusammenfassungen UND 30
            Matches UND 30 Anschreiben. Dieselbe Stelle kostet pro Feature nur einmal einen Credit
            Erneutes Öffnen oder Neu-Generieren ist gratis. Dein Gratis-Kontingent wird immer zuerst
            verbraucht.
          </p>
          <p>
            Bezahlung sicher über Stripe (Karte, PayPal u. a.). Alle Preise sind Endpreise. Mit dem
            Kauf stimmst du der sofortigen Bereitstellung zu; dein Widerrufsrecht erlischt damit
            (Details in den AGB).
          </p>
        </div>
      </Container>
    </Section>
  )
}
