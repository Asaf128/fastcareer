import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { summarizeJob } from '@/lib/ai/summarizeJob'
import { isRateLimited } from '@/lib/ai/rateLimit'
import type { JobSummary } from '@/types/ai.types'
import type { Json } from '@/types/database'

interface JobSummaryInput {
  refnr: string
  titel: string
  arbeitgeber: string
  ort: string
  beschreibung: string
  /** Für die Kosten-Zuordnung im Admin-Dashboard, null = anonym */
  userId: string | null
}

function fallbackSummary(input: JobSummaryInput): JobSummary {
  return {
    kurzbeschreibung: input.beschreibung.slice(0, 400),
    aufgaben: [],
    anforderungen: [],
    benefits: [],
    arbeitszeit: null,
    standort: input.ort || null,
    unternehmen: input.arbeitgeber,
  }
}

export async function getOrCreateJobSummary(input: JobSummaryInput): Promise<JobSummary> {
  const supabase = await createClient()

  const { data: cached } = await supabase
    .from('job_summaries')
    .select('summary')
    .eq('job_refnr', input.refnr)
    .maybeSingle()

  if (cached) return cached.summary as unknown as JobSummary

  const requestHeaders = await headers()
  const ip = requestHeaders.get('x-forwarded-for') ?? 'anonymous'

  if (await isRateLimited(`summary:${ip}`)) {
    return fallbackSummary(input)
  }

  let summary: JobSummary
  try {
    summary = await summarizeJob(input, input.userId)
  } catch (error) {
    console.error('Job-Zusammenfassung fehlgeschlagen:', error)
    return fallbackSummary(input)
  }

  // Insert über den Service-Role-Client: die offene INSERT-Policy wurde
  // entfernt (Cache-Poisoning-Schutz), Clients können nicht mehr direkt schreiben.
  try {
    const admin = createAdminClient()
    const { error: insertError } = await admin.from('job_summaries').insert({
      job_refnr: input.refnr,
      summary: summary as unknown as Json,
      model: 'gemini-2.5-flash',
    })
    if (insertError) {
      console.error('Job-Zusammenfassung konnte nicht gecacht werden:', insertError.code)
    }
  } catch (error) {
    console.error('Admin-Client nicht verfügbar, Zusammenfassung nicht gecacht:', error)
  }

  return summary
}
