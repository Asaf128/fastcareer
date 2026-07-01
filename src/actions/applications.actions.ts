'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

const jobBaseSchema = z.object({
  jobRefnr: z.string().min(1),
  titel: z.string().min(1),
  arbeitgeber: z.string().min(1),
  ort: z.string().optional(),
})

async function ensureApplicationRow(
  supabase: SupabaseServerClient,
  userId: string,
  job: z.infer<typeof jobBaseSchema>
) {
  await supabase.from('applications').upsert(
    {
      user_id: userId,
      job_refnr: job.jobRefnr,
      titel: job.titel,
      arbeitgeber: job.arbeitgeber,
      ort: job.ort ?? null,
    },
    { onConflict: 'user_id,job_refnr', ignoreDuplicates: true }
  )
}

export async function saveApplication(input: z.infer<typeof jobBaseSchema>) {
  const parsed = jobBaseSchema.safeParse(input)
  if (!parsed.success) return { error: 'Ungültige Job-Daten.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  const { error } = await supabase.from('applications').upsert(
    {
      user_id: user.id,
      job_refnr: parsed.data.jobRefnr,
      titel: parsed.data.titel,
      arbeitgeber: parsed.data.arbeitgeber,
      ort: parsed.data.ort ?? null,
    },
    { onConflict: 'user_id,job_refnr', ignoreDuplicates: true }
  )

  if (error) return { error: 'Konnte nicht gespeichert werden.' }

  revalidatePath('/bewerbungen')
  return { error: null }
}

export async function removeApplication(jobRefnr: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('user_id', user.id)
    .eq('job_refnr', jobRefnr)

  if (error) return { error: 'Konnte nicht entfernt werden.' }

  revalidatePath('/bewerbungen')
  return { error: null }
}

const checklistSchema = jobBaseSchema.extend({
  applied: z.boolean().optional(),
  answered: z.boolean().optional(),
})

export async function updateChecklist(input: z.infer<typeof checklistSchema>) {
  const parsed = checklistSchema.safeParse(input)
  if (!parsed.success) return { error: 'Ungültige Eingabe.' }
  if (parsed.data.applied === undefined && parsed.data.answered === undefined) {
    return { error: 'Keine Änderung übergeben.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  await ensureApplicationRow(supabase, user.id, parsed.data)

  const updates: { applied?: boolean; answered?: boolean } = {}
  if (parsed.data.applied !== undefined) updates.applied = parsed.data.applied
  if (parsed.data.answered !== undefined) updates.answered = parsed.data.answered

  const { error } = await supabase
    .from('applications')
    .update(updates)
    .eq('user_id', user.id)
    .eq('job_refnr', parsed.data.jobRefnr)

  if (error) return { error: 'Konnte nicht gespeichert werden.' }

  revalidatePath('/bewerbungen')
  return { error: null }
}

const notesSchema = jobBaseSchema.extend({
  notes: z.string().max(5000),
})

export async function saveNotes(input: z.infer<typeof notesSchema>) {
  const parsed = notesSchema.safeParse(input)
  if (!parsed.success) return { error: 'Ungültige Eingabe.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  await ensureApplicationRow(supabase, user.id, parsed.data)

  const { error } = await supabase
    .from('applications')
    .update({ notes: parsed.data.notes })
    .eq('user_id', user.id)
    .eq('job_refnr', parsed.data.jobRefnr)

  if (error) return { error: 'Notizen konnten nicht gespeichert werden.' }
  return { error: null }
}

const coverLetterSchema = jobBaseSchema.extend({
  coverLetter: z.string().max(10000),
})

export async function saveCoverLetter(input: z.infer<typeof coverLetterSchema>) {
  const parsed = coverLetterSchema.safeParse(input)
  if (!parsed.success) return { error: 'Ungültige Eingabe.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  await ensureApplicationRow(supabase, user.id, parsed.data)

  const { error } = await supabase
    .from('applications')
    .update({ cover_letter: parsed.data.coverLetter })
    .eq('user_id', user.id)
    .eq('job_refnr', parsed.data.jobRefnr)

  if (error) return { error: 'Anschreiben konnte nicht gespeichert werden.' }
  return { error: null }
}
