import Link from 'next/link'
import { Lock, Sparkles } from 'lucide-react'
import { DAILY_LIMIT } from '@/lib/usage'

interface LimitNoticeProps {
  isAuthenticated: boolean
  children: React.ReactNode
}

/**
 * Gemeinsame Karte für alle erreichten Tageskontingente (Zusammenfassung,
 * Match, Anschreiben) — nur der Meldungstext unterscheidet sich pro Feature.
 */
function LimitNotice({ isAuthenticated, children }: LimitNoticeProps) {
  return (
    <div className="border-border bg-surface mt-6 rounded-xl border border-dashed p-6 text-center lg:p-8">
      <Lock className="text-accent mx-auto h-6 w-6" />
      <h2 className="text-foreground mt-3 text-lg font-semibold">
        {isAuthenticated ? 'Tageslimit erreicht' : 'Gratis-Limit für heute erreicht'}
      </h2>
      <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm">{children}</p>
      {isAuthenticated ? (
        <span className="bg-accent/10 text-accent mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Unbegrenzt mit Pro — bald verfügbar
        </span>
      ) : (
        <Link
          href="/login"
          className="bg-accent hover:bg-accent-dark mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
        >
          Kostenlos anmelden
        </Link>
      )}
    </div>
  )
}

/** Ersetzt die KI-Zusammenfassung, wenn das Tageskontingent aufgebraucht ist. */
export function SummaryLimitNotice({
  isAuthenticated,
  quelleUrl,
}: {
  isAuthenticated: boolean
  quelleUrl: string
}) {
  return (
    <LimitNotice isAuthenticated={isAuthenticated}>
      Du hast heute {DAILY_LIMIT} KI-Zusammenfassungen genutzt — morgen geht&apos;s kostenlos
      weiter. Die vollständige Stellenanzeige kannst du jederzeit über{' '}
      <a
        href={quelleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground font-medium underline underline-offset-2"
      >
        Original-Anzeige öffnen
      </a>{' '}
      lesen.
    </LimitNotice>
  )
}

/**
 * Limit-Karte für Match & Anschreiben (beide nur für angemeldete Nutzer) —
 * ersetzt die bisherige Toast-Meldung.
 */
export function FeatureLimitNotice({ featureLabel }: { featureLabel: string }) {
  return (
    <LimitNotice isAuthenticated>
      Du hast heute {DAILY_LIMIT} {featureLabel} genutzt — morgen geht&apos;s kostenlos weiter.
    </LimitNotice>
  )
}

/**
 * Sichtbares Restkontingent ("X von 3 heute übrig"), damit das Limit nicht
 * erst beim Erreichen auffällt — für anonyme UND angemeldete Nutzer.
 */
export function UsageRemainingHint({
  label,
  remaining,
  showLoginLink = false,
}: {
  label: string
  remaining: number
  showLoginLink?: boolean
}) {
  return (
    <p className="text-text-secondary mt-2 flex flex-wrap items-center justify-center gap-1.5 text-center text-xs">
      <Sparkles className="text-accent h-3.5 w-3.5 shrink-0" />
      {label}: {remaining} von {DAILY_LIMIT} heute übrig
      {showLoginLink && (
        <>
          {' '}
          —{' '}
          <Link href="/login" className="text-accent hover:underline">
            kostenlos anmelden
          </Link>
        </>
      )}
    </p>
  )
}
