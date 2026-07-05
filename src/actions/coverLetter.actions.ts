'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateCoverLetter } from '@/lib/ai/generateCoverLetter'
import { getOrCreateJobSummary } from '@/lib/jobs/jobSummaryCache'
import { getJobDetail } from '@/lib/jobs/arbeitsagentur-detail'
import { isRateLimited } from '@/lib/ai/rateLimit'
import { USAGE_LIMIT } from '@/lib/usage'
import { consumeAiQuota, refundAiQuota, type QuotaParams } from '@/lib/quota'

const inputSchema = z.object({
  jobRefnr: z.string().min(1),
  titel: z.string().min(1),
  arbeitgeber: z.string().min(1),
  ort: z.string().optional(),
})

const MAX_LETTERS_PER_MINUTE = 3

// Generiert das Anschreiben erst auf Klick (statt beim Seitenaufbau) und
// speichert es sofort server-seitig, ein Reload kostet damit keinen
// zweiten Gemini-Pro-Call mehr.
export async function generateAndSaveCoverLetter(
  input: z.infer<typeof inputSchema>
): Promise<
  | { error: string; limitReached?: boolean }
  | { error: null; coverLetter: string; remaining: number | null }
> {
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) return { error: 'Ungültige Job-Daten.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  if (await isRateLimited(`letter:${user.id}`, MAX_LETTERS_PER_MINUTE)) {
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
    feature: 'letter',
    userKey: user.id,
    userId: user.id,
    email: user.email,
    jobRefnr: parsed.data.jobRefnr,
  }
  const quota = await consumeAiQuota(quotaParams)
  if (!quota.allowed) {
    return {
      error: `Kontingent erreicht: ${USAGE_LIMIT} KI-Anschreiben alle 7 Tage sind kostenlos.`,
      limitReached: true,
    }
  }

  const { jobRefnr, titel, arbeitgeber } = parsed.data
  const ort = parsed.data.ort ?? ''

  let beschreibung = ''
  try {
    const detail = await getJobDetail(jobRefnr)
    beschreibung = detail.beschreibung
  } catch (error) {
    console.error('Job-Detail für Anschreiben nicht abrufbar:', error)
  }

  const summary = await getOrCreateJobSummary({
    refnr: jobRefnr,
    titel,
    arbeitgeber,
    ort,
    beschreibung,
    userId: user.id,
  })

  let coverLetter: string
  try {
    coverLetter = await generateCoverLetter({ titel, arbeitgeber, ort, summary, profile }, user.id)
  } catch (error) {
    console.error('Anschreiben-Generierung fehlgeschlagen:', error)
    // Gescheiterter Versuch soll kein Kontingent kosten
    await refundAiQuota(quotaParams, quota)
    return { error: 'Anschreiben konnte nicht erstellt werden. Bitte versuche es erneut.' }
  }

  const { error: saveError } = await supabase.from('applications').upsert(
    {
      user_id: user.id,
      job_refnr: jobRefnr,
      titel,
      arbeitgeber,
      ort: parsed.data.ort ?? null,
      cover_letter: coverLetter,
    },
    { onConflict: 'user_id,job_refnr' }
  )

  if (saveError) {
    console.error('Anschreiben konnte nicht gespeichert werden:', saveError.code)
  }

  return { error: null, coverLetter, remaining: quota.remaining }
}
