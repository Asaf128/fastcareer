import Link from 'next/link'
import { ArrowUp, Lock, Sparkles } from 'lucide-react'
import { DAILY_LIMIT } from '@/lib/usage'

/**
 * Ersetzt die KI-Zusammenfassung, wenn das Tageskontingent aufgebraucht ist.
 * Suche und Original-Anzeige bleiben frei — darauf weist die Karte hin.
 */
export function SummaryLimitNotice({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="border-border bg-surface mt-6 rounded-xl border border-dashed p-6 text-center lg:p-8">
      <Lock className="text-accent mx-auto h-6 w-6" />
      <h2 className="text-foreground mt-3 text-lg font-semibold">
        {isAuthenticated ? 'Tageslimit erreicht' : 'Gratis-Limit für heute erreicht'}
      </h2>
      <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm">
        Du hast heute {DAILY_LIMIT} KI-Zusammenfassungen genutzt — morgen geht&apos;s kostenlos
        weiter. Die vollständige Stellenanzeige kannst du jederzeit oben über{' '}
        <span className="text-foreground inline-flex items-center gap-1 font-medium">
          <ArrowUp className="h-3.5 w-3.5" />
          Original-Anzeige öffnen
        </span>{' '}
        lesen.
      </p>
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

/**
 * Sichtbares Gratis-Kontingent für anonyme Nutzer unter der
 * Zusammenfassung — macht klar, dass sie gerade ein Gratis-Kontingent nutzen.
 */
export function SummaryTasterHint({ remaining }: { remaining: number }) {
  return (
    <p className="text-text-secondary mt-2 flex items-center justify-center gap-1.5 text-center text-xs">
      <Sparkles className="text-accent h-3.5 w-3.5 shrink-0" />
      Gratis KI-Zusammenfassungen: {remaining} von {DAILY_LIMIT} heute übrig —{' '}
      <Link href="/login" className="text-accent hover:underline">
        kostenlos anmelden
      </Link>
    </p>
  )
}
