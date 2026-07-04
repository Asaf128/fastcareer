import Link from 'next/link'
import type { CreditFeature } from '@/lib/credits'
import { USAGE_LIMIT, usagePeriodResetAt } from '@/lib/usage'

interface CreditsSectionProps {
  /** null = noch nie Credits gekauft */
  balance: Record<CreditFeature, number> | null
  isPro: boolean
  /** Restkontingent des Gratis-Zeitraums pro Feature, null nur für Pro */
  freeRemaining: Record<CreditFeature, number> | null
}

const LABELS: Record<CreditFeature, string> = {
  summary: 'Zusammenfassungen',
  match: 'Match-Berechnungen',
  letter: 'Anschreiben',
}

function formatResetDate(): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Berlin',
  }).format(usagePeriodResetAt())
}

/** Credit-Guthaben im Profil, mit Link zur Kaufseite (Pro-Konten: unbegrenzt). */
export function CreditsSection({ balance, isPro, freeRemaining }: CreditsSectionProps) {
  if (isPro) {
    return (
      <section className="border-border bg-background mt-8 rounded-xl border p-6 shadow-sm">
        <h2 className="text-foreground text-lg font-semibold">Pro-Tarif</h2>
        <p className="text-text-secondary mt-1 text-sm">
          Du hast einen gesonderten Tarif und kannst alle KI-Features unbegrenzt nutzen.
        </p>
      </section>
    )
  }

  const featuresAtZero = freeRemaining
    ? (Object.keys(LABELS) as CreditFeature[]).filter((feature) => freeRemaining[feature] === 0)
    : []

  return (
    <section className="border-border bg-background mt-8 rounded-xl border p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Meine Credits</h2>
          <p className="text-text-secondary mt-1 text-sm">
            {balance
              ? 'Dein Guthaben wird genutzt, sobald das Gratis-Kontingent aufgebraucht ist.'
              : `Du hast noch keine Credits. ${USAGE_LIMIT} Nutzungen pro KI-Feature sind alle 7 Tage gratis.`}
          </p>
        </div>
        <Link href="/credits" className="text-accent shrink-0 text-sm font-medium hover:underline">
          Credits kaufen →
        </Link>
      </div>

      {freeRemaining && (
        <dl className="mt-4 grid grid-cols-3 gap-3">
          {(Object.keys(LABELS) as CreditFeature[]).map((feature) => (
            <div
              key={feature}
              className="border-border bg-surface rounded-lg border p-3 text-center"
            >
              <dd className="text-foreground text-xl font-semibold">
                {freeRemaining[feature]}
                <span className="text-text-secondary text-xs font-normal"> / {USAGE_LIMIT}</span>
              </dd>
              <dt className="text-text-secondary mt-0.5 text-xs">{LABELS[feature]} gratis</dt>
            </div>
          ))}
        </dl>
      )}
      {featuresAtZero.length > 0 && (
        <p className="text-text-secondary mt-2 text-xs">
          Gratis-Kontingent für {featuresAtZero.map((feature) => LABELS[feature]).join(', ')} setzt
          sich am {formatResetDate()} zurück.
        </p>
      )}

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
