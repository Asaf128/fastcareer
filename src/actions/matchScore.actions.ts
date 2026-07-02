'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { calculateMatchScore } from '@/lib/ai/matchScore'
import { getOrCreateJobSummary } from '@/lib/jobs/jobSummaryCache'
import { getJobDetail } from '@/lib/jobs/arbeitsagentur-detail'
import { isRateLimited } from '@/lib/ai/rateLimit'
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
): Promise<{ error: string } | { error: null; result: MatchScoreResult }> {
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

  try {
    const result = await calculateMatchScore({ titel: parsed.data.titel, summary, profile })
    return { error: null, result }
  } catch (error) {
    console.error('Match-Score fehlgeschlagen:', error)
    return { error: 'Match-Score konnte nicht berechnet werden. Bitte versuche es erneut.' }
  }
}
