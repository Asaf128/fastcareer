import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import type { CreditFeature } from '@/lib/credits'

interface CreditsSectionProps {
  /** null = noch nie Credits gekauft */
  balance: Record<CreditFeature, number> | null
  isPro: boolean
}

const LABELS: Record<CreditFeature, string> = {
  summary: 'Zusammenfassungen',
  match: 'Match-Berechnungen',
  letter: 'Anschreiben',
}

/** Credit-Guthaben im Profil, mit Link zur Kaufseite (Pro-Konten: unbegrenzt). */
export function CreditsSection({ balance, isPro }: CreditsSectionProps) {
  if (isPro) {
    return (
      <section className="border-border bg-background mt-8 rounded-xl border p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="bg-accent/10 text-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-foreground text-lg font-semibold">Pro-Tarif</h2>
            <p className="text-text-secondary mt-1 text-sm">
              Du hast einen gesonderten Tarif und kannst alle KI-Features unbegrenzt nutzen.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-border bg-background mt-8 rounded-xl border p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Meine Credits</h2>
          <p className="text-text-secondary mt-1 text-sm">
            {balance
              ? 'Dein Guthaben wird genutzt, sobald das Gratis-Tageskontingent aufgebraucht ist.'
              : 'Du hast noch keine Credits. 3 Nutzungen pro KI-Feature sind täglich gratis.'}
          </p>
        </div>
        <Link href="/credits" className="text-accent shrink-0 text-sm font-medium hover:underline">
          Credits kaufen →
        </Link>
      </div>
      {balance && (
        <dl className="mt-4 grid grid-cols-3 gap-3">
          {(Object.keys(LABELS) as CreditFeature[]).map((feature) => (
            <div
              key={feature}
              className="border-border bg-surface rounded-lg border p-3 text-center"
            >
              <dd className="text-foreground text-xl font-semibold">{balance[feature]}</dd>
              <dt className="text-text-secondary mt-0.5 text-xs">{LABELS[feature]}</dt>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
