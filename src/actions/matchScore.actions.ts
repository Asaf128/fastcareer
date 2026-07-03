'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { calculateMatchScore } from '@/lib/ai/matchScore'
import { getOrCreateJobSummary } from '@/lib/jobs/jobSummaryCache'
import { getJobDetail } from '@/lib/jobs/arbeitsagentur-detail'
import { isRateLimited } from '@/lib/ai/rateLimit'
import { consumeDailyUnique, refundDailyUnique, DAILY_LIMIT } from '@/lib/usage'
import { isProUser } from '@/lib/pro'
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

  // Freemium: 3 Match-Scores pro Tag — dieselbe Stelle zählt nur einmal,
  // Pro (Admin-E-Mail) ist ausgenommen. remaining=null heißt unbegrenzt.
  const isPro = isProUser(user.email)
  let remaining: number | null = null
  if (!isPro) {
    const usage = await consumeDailyUnique('match', user.id, parsed.data.jobRefnr)
    if (!usage.allowed) {
      return {
        error: `Tageslimit erreicht: ${DAILY_LIMIT} Match-Scores pro Tag sind kostenlos.`,
        limitReached: true,
      }
    }
    remaining = usage.remaining
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
  })

  let result: MatchScoreResult
  try {
    result = await calculateMatchScore({ titel: parsed.data.titel, summary, profile })
  } catch (error) {
    console.error('Match-Score fehlgeschlagen:', error)
    // Gescheiterter Versuch soll kein Kontingent kosten
    if (!isPro) await refundDailyUnique('match', user.id, parsed.data.jobRefnr)
    return { error: 'Match-Score konnte nicht berechnet werden. Bitte versuche es erneut.' }
  }

  // Sofort speichern — ein erneuter Seitenbesuch kostet dann keinen zweiten
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

  return { error: null, result, remaining }
}
