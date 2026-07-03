import { consumeDailyUnique, refundDailyUnique, peekDailyRemaining } from '@/lib/usage'
import { consumeCredit, refundCredit, getCreditBalance, type CreditFeature } from '@/lib/credits'
import { isProUser } from '@/lib/pro'

/**
 * Kontingent-Kaskade für die KI-Features: Pro (Admin-E-Mail, unbegrenzt)
 * → Gratis-Tageskontingent (3/Tag, Redis) → gekaufte Credits (Supabase)
 * → Limit erreicht. Anonyme Nutzer haben nur das Tageskontingent.
 */
export type QuotaSource = 'pro' | 'free' | 'credit'

export interface QuotaResult {
  allowed: boolean
  /** Woraus der Aufruf bezahlt wurde — null, wenn nicht erlaubt */
  source: QuotaSource | null
  /** Rest in der genutzten Quelle nach diesem Aufruf; null = unbegrenzt */
  remaining: number | null
  /** true, wenn ein gekaufter Credit abgebucht wurde (für den Refund) */
  creditCharged: boolean
}

export interface QuotaParams {
  feature: CreditFeature
  /** Redis-Schlüssel fürs Tageskontingent: User-ID oder `ip:<addr>` */
  userKey: string
  /** null = anonym — dann gibt es keine Credits */
  userId: string | null
  email: string | null | undefined
  jobRefnr: string
}

export async function consumeAiQuota(params: QuotaParams): Promise<QuotaResult> {
  if (isProUser(params.email)) {
    return { allowed: true, source: 'pro', remaining: null, creditCharged: false }
  }

  const daily = await consumeDailyUnique(params.feature, params.userKey, params.jobRefnr)
  if (daily.allowed) {
    return { allowed: true, source: 'free', remaining: daily.remaining, creditCharged: false }
  }

  if (params.userId) {
    const credit = await consumeCredit(params.feature, params.jobRefnr)
    if (credit.allowed) {
      return {
        allowed: true,
        source: 'credit',
        remaining: credit.remaining,
        creditCharged: credit.charged,
      }
    }
  }

  return { allowed: false, source: null, remaining: 0, creditCharged: false }
}

/** Verbrauch zurückgeben, wenn die KI-Aktion danach fehlgeschlagen ist. */
export async function refundAiQuota(params: QuotaParams, result: QuotaResult): Promise<void> {
  if (result.source === 'free') {
    await refundDailyUnique(params.feature, params.userKey, params.jobRefnr)
  } else if (result.source === 'credit' && result.creditCharged) {
    await refundCredit(params.feature, params.jobRefnr)
  }
}

/**
 * Verfügbares Gesamt-Kontingent (Gratis heute + gekaufte Credits) nur
 * LESEN — für die Anzeige, ob ein Panel den Limit-Zustand zeigen muss.
 * null = unbegrenzt (Pro).
 */
export async function peekAiQuota(
  feature: CreditFeature,
  userKey: string,
  userId: string | null,
  email: string | null | undefined
): Promise<number | null> {
  if (isProUser(email)) return null
  const free = await peekDailyRemaining(feature, userKey)
  if (!userId) return free
  const balance = await getCreditBalance()
  return free + (balance?.[feature] ?? 0)
}
