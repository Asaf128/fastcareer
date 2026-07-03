import { createClient } from '@/lib/supabase/server'

/**
 * Gekaufte Credit-Pakete: Guthaben pro Feature (Zusammenfassung, Match,
 * Anschreiben), verwaltet in `credit_balances`. Verbrauch läuft über die
 * Postgres-Funktion `consume_credit` (atomar, Dedupe pro Stelle via
 * `credit_usages`) — Gutschrift macht später der Stripe-Webhook.
 */
export type CreditFeature = 'summary' | 'match' | 'letter'

export interface CreditResult {
  allowed: boolean
  /** Guthaben nach diesem Aufruf */
  remaining: number
  /** true, wenn JETZT abgebucht wurde — Basis für refundCredit */
  charged: boolean
}

const NO_CREDIT: CreditResult = { allowed: false, remaining: 0, charged: false }

/**
 * Einen Credit für diese Stelle verbrauchen (dieselbe Stelle kostet pro
 * Feature nur einmal). DB-Fehler — z. B. Migration noch nicht angewendet —
 * verhalten sich wie "keine Credits", das Gratis-Tageskontingent bleibt
 * davon unberührt.
 */
export async function consumeCredit(
  feature: CreditFeature,
  jobRefnr: string
): Promise<CreditResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('consume_credit', {
    p_feature: feature,
    p_job_refnr: jobRefnr,
  })
  if (error || !data?.[0]) {
    if (error) console.error('Credit-Verbrauch fehlgeschlagen:', error.code ?? error.message)
    return NO_CREDIT
  }
  return data[0]
}

/** Credit zurückgeben, wenn die KI-Aktion nach dem Abbuchen fehlschlägt. */
export async function refundCredit(feature: CreditFeature, jobRefnr: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('refund_credit', {
    p_feature: feature,
    p_job_refnr: jobRefnr,
  })
  if (error) console.error('Credit-Refund fehlgeschlagen:', error.code ?? error.message)
}

/** Guthaben des eingeloggten Nutzers lesen — null, wenn nie Credits gekauft. */
export async function getCreditBalance(): Promise<Record<CreditFeature, number> | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('credit_balances')
    .select('summary_credits, match_credits, letter_credits')
    .maybeSingle()
  if (error) {
    console.error('Credit-Guthaben nicht lesbar:', error.code)
    return null
  }
  if (!data) return null
  return {
    summary: data.summary_credits,
    match: data.match_credits,
    letter: data.letter_credits,
  }
}
