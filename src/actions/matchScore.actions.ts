'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { calculateMatchScore } from '@/lib/ai/matchScore'
import { getOrCreateJobSummary } from '@/lib/jobs/jobSummaryCache'
import { getJobDetail } from '@/lib/jobs/arbeitsagentur-detail'
import { isRateLimited } from '@/lib/ai/rateLimit'
import { USAGE_LIMIT } from '@/lib/usage'
import { consumeAiQuota, refundAiQuota, type QuotaParams } from '@/lib/quota'
import type { MatchScoreResult } from '@/types/ai.types'

const inputSchema = z.object({
  jobRefnr: z.string().min(1),
  titel: z.string().min(1),
  arbeitgeber: z.string().min(1),
  ort: z.string().optional(),
})

const MAX_SCORES_PER_MINUTE = 5

export async function getMatchScore(
  input: z.infer<typeof inputSchema>
): Promise<
  | { error: string; limitReached?: boolean }
  | { error: null; result: MatchScoreResult; remaining: number | null }
> {
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) return { error: 'Ungültige Job-Daten.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  if (await isRateLimited(`match:${user.id}`, MAX_SCORES_PER_MINUTE)) {
    return { error: 'Zu viele Anfragen kurz hintereinander. Bitte warte eine Minute.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile) return { error: 'Bitte fülle zuerst dein Profil aus.' }

  // Kontingent-Kaskade: Pro → 2 Gratis alle 7 Tage → gekaufte Credits.
  // Dieselbe Stelle zählt nur einmal. remaining=null heißt unbegrenzt (Pro).
  const quotaParams: QuotaParams = {
    feature: 'match',
    userKey: user.id,
    userId: user.id,
    email: user.email,
    jobRefnr: parsed.data.jobRefnr,
  }
  const quota = await consumeAiQuota(quotaParams)
  if (!quota.allowed) {
    return {
      error: `Kontingent erreicht: ${USAGE_LIMIT} Match-Scores alle 7 Tage sind kostenlos.`,
      limitReached: true,
    }
  }

  let beschreibung = ''
  try {
    const detail = await getJobDetail(parsed.data.jobRefnr)
    beschreibung = detail.beschreibung
  } catch (error) {
    console.error('Job-Detail für Match-Score nicht abrufbar:', error)
  }

  const summary = await getOrCreateJobSummary({
    refnr: parsed.data.jobRefnr,
    titel: parsed.data.titel,
    arbeitgeber: parsed.data.arbeitgeber,
    ort: parsed.data.ort ?? '',
    beschreibung,
    userId: user.id,
  })

  let result: MatchScoreResult
  try {
    result = await calculateMatchScore({ titel: parsed.data.titel, summary, profile }, user.id)
  } catch (error) {
    console.error('Match-Score fehlgeschlagen:', error)
    // Gescheiterter Versuch soll kein Kontingent kosten
    await refundAiQuota(quotaParams, quota)
    return { error: 'Match-Score konnte nicht berechnet werden. Bitte versuche es erneut.' }
  }

  // Sofort speichern, ein erneuter Seitenbesuch kostet dann keinen zweiten
  // Gemini-Call mehr (gleiche Logik wie beim Anschreiben)
  const { error: saveError } = await supabase.from('applications').upsert(
    {
      user_id: user.id,
      job_refnr: parsed.data.jobRefnr,
      titel: parsed.data.titel,
      arbeitgeber: parsed.data.arbeitgeber,
      ort: parsed.data.ort ?? null,
      match_score: result.score,
      match_begruendung: result.begruendung,
    },
    { onConflict: 'user_id,job_refnr' }
  )
  if (saveError) {
    console.error('Match-Score konnte nicht gespeichert werden:', saveError.code)
  }

  return { error: null, result, remaining: quota.remaining }
}
