'use client'

import { useState, useTransition } from 'react'
import { Gauge } from 'lucide-react'
import { toast } from 'sonner'
import { getMatchScore } from '@/actions/matchScore.actions'
import { Button } from '@/components/shared/Button'
import { FeatureLimitNotice, UsageRemainingHint } from '@/components/jobs/UsageLimit'
import { cn } from '@/lib/cn'
import type { MatchScoreResult } from '@/types/ai.types'

interface MatchScoreProps {
  jobRefnr: string
  titel: string
  arbeitgeber: string
  ort: string
  isAuthenticated: boolean
  hasProfile: boolean
  /** Verbleibende Match-Berechnungen heute (null heißt unbegrenzt, Pro) */
  initialRemaining: number | null
  initialResult: MatchScoreResult | null
}

function scoreColorClass(score: number): string {
  if (score >= 70) return 'text-success'
  if (score >= 40) return 'text-warning'
  return 'text-error'
}

export function MatchScore({
  jobRefnr,
  titel,
  arbeitgeber,
  ort,
  isAuthenticated,
  hasProfile,
  initialRemaining,
  initialResult,
}: MatchScoreProps) {
  const [result, setResult] = useState<MatchScoreResult | null>(initialResult)
  const [remaining, setRemaining] = useState(initialRemaining)
  const [limitReached, setLimitReached] = useState(initialRemaining === 0)
  const [isPending, startTransition] = useTransition()

  // Ohne Login/Profil keinen Teaser zeigen, dafür werben schon
  // Anschreiben-Panel und Bewerbungsstand auf derselben Seite
  if (!isAuthenticated || !hasProfile) return null

  function handleCalculate() {
    startTransition(async () => {
      const response = await getMatchScore({ jobRefnr, titel, arbeitgeber, ort })
      if (response.error !== null) {
        // Beim Tageslimit die Limit-Karte zeigen statt einer Toast-Meldung
        if (response.limitReached) setLimitReached(true)
        else toast.error(response.error)
        return
      }
      setResult(response.result)
      setRemaining(response.remaining)
    })
  }

  // Limit erreicht und noch kein gespeicherter Score: dieselbe Karte wie
  // bei der Zusammenfassung, nur mit Match-Text
  if (!result && limitReached) {
    return <FeatureLimitNotice featureLabel="Match-Berechnungen" />
  }

  return (
    <div className="border-border bg-background mt-6 rounded-xl border p-6 shadow-sm lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Passt der Job zu dir?</h2>
          <p className="text-text-secondary mt-1 text-sm">
            Die KI vergleicht dein Profil mit den Anforderungen der Stelle.
          </p>
        </div>
        {!result && (
          <Button variant="secondary" onClick={handleCalculate} isLoading={isPending}>
            <Gauge className="h-4 w-4" />
            Match berechnen
          </Button>
        )}
      </div>

      {!result && remaining != null && (
        <UsageRemainingHint label="Match-Berechnungen" remaining={remaining} />
      )}

      {result && (
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
          <div className="shrink-0 text-center">
            <p className={cn('text-4xl font-semibold', scoreColorClass(result.score))}>
              {result.score} %
            </p>
            <p className="text-text-secondary mt-1 text-xs">Übereinstimmung</p>
          </div>
          <ul className="text-text-primary space-y-1.5 text-sm">
            {result.begruendung.map((punkt) => (
              <li key={punkt} className="flex gap-2">
                <span aria-hidden="true" className="text-accent">
                  •
                </span>
                {punkt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
