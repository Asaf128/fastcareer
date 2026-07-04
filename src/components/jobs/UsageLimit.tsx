import Link from 'next/link'
import { Lock } from 'lucide-react'
import { USAGE_LIMIT, usagePeriodResetAt } from '@/lib/usage'

interface LimitNoticeProps {
  isAuthenticated: boolean
  children: React.ReactNode
}

/** Formatiert die Reset-Zeit als kurzes deutsches Datum, z. B. "8. Juli". */
function formatResetDate(): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Berlin',
  }).format(usagePeriodResetAt())
}

/**
 * Gemeinsame Karte für alle erreichten Gratis-Kontingente (Zusammenfassung,
 * Match, Anschreiben). Nur der Meldungstext unterscheidet sich pro Feature.
 * Nicht angemeldete Nutzer sehen dieselbe "Credits kaufen"-Beschriftung wie
 * angemeldete, denn Anmelden allein schaltet kein weiteres Gratis-Kontingent
 * frei. Der Link führt sie zuerst zum Login, da ein Kauf ein Konto braucht.
 */
function LimitNotice({ isAuthenticated, children }: LimitNoticeProps) {
  return (
    <div className="border-border bg-surface mt-6 rounded-xl border border-dashed p-6 text-center lg:p-8">
      <Lock className="text-accent mx-auto h-6 w-6" />
      <h2 className="text-foreground mt-3 text-lg font-semibold">
        {isAuthenticated ? 'Kontingent erreicht' : 'Gratis-Kontingent erreicht'}
      </h2>
      <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm">{children}</p>
      <p className="text-text-secondary mt-1 text-xs">Setzt sich am {formatResetDate()} zurück.</p>
      <Link
        href={isAuthenticated ? '/credits' : '/login?next=/credits'}
        className="bg-accent hover:bg-accent-dark mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
      >
        Credits kaufen, ab 1,99 €
      </Link>
    </div>
  )
}

/** Ersetzt die KI-Zusammenfassung, wenn das Gratis-Kontingent aufgebraucht ist. */
export function SummaryLimitNotice({
  isAuthenticated,
  quelleUrl,
}: {
  isAuthenticated: boolean
  quelleUrl: string
}) {
  return (
    <LimitNotice isAuthenticated={isAuthenticated}>
      Du hast {USAGE_LIMIT} KI-Zusammenfassungen in den letzten 7 Tagen genutzt, danach geht&apos;s
      kostenlos weiter. Die vollständige Stellenanzeige kannst du jederzeit über{' '}
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
 * Limit-Karte für Match & Anschreiben (beide nur für angemeldete Nutzer),
 * ersetzt die bisherige Toast-Meldung.
 */
export function FeatureLimitNotice({ featureLabel }: { featureLabel: string }) {
  return (
    <LimitNotice isAuthenticated>
      Du hast {USAGE_LIMIT} {featureLabel} in den letzten 7 Tagen genutzt, danach geht&apos;s
      kostenlos weiter.
    </LimitNotice>
  )
}

/**
 * Sichtbares Restkontingent ("X von 2 übrig"), damit das Limit nicht erst
 * beim Erreichen auffällt, für anonyme UND angemeldete Nutzer. Liegt der
 * Wert über dem Gratis-Kontingent, stecken gekaufte Credits dahinter.
 */
export function UsageRemainingHint({
  label,
  remaining,
  showLoginLink = false,
  align = 'center',
}: {
  /** Feature-Bezeichnung ohne Präfix, z. B. "KI-Anschreiben" */
  label: string
  remaining: number
  showLoginLink?: boolean
  /** 'start' richtet den Hinweis an linksbündigem Inhalt darüber aus */
  align?: 'center' | 'start'
}) {
  return (
    <p
      className={`text-text-secondary mt-2 flex flex-wrap items-center gap-1.5 text-xs ${
        align === 'start' ? 'justify-start text-left' : 'justify-center text-center'
      }`}
    >
      {remaining > USAGE_LIMIT
        ? `${label}: noch ${remaining} verfügbar (${USAGE_LIMIT} gratis alle 7 Tage + deine Credits)`
        : `Gratis ${label}: ${remaining} von ${USAGE_LIMIT} übrig`}
      {showLoginLink && (
        <>
          {', '}
          <Link href="/login" className="text-accent hover:underline">
            kostenlos anmelden
          </Link>
        </>
      )}
    </p>
  )
}
