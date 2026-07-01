'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const favoriteSchema = z.object({
  jobRefnr: z.string().min(1),
  titel: z.string().min(1),
  arbeitgeber: z.string().min(1),
  ort: z.string().optional(),
})

export async function addFavorite(input: z.infer<typeof favoriteSchema>) {
  const parsed = favoriteSchema.safeParse(input)
  if (!parsed.success) return { error: 'Ungültige Job-Daten.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    job_refnr: parsed.data.jobRefnr,
    titel: parsed.data.titel,
    arbeitgeber: parsed.data.arbeitgeber,
    ort: parsed.data.ort ?? null,
  })

  if (error) return { error: 'Konnte nicht gespeichert werden.' }

  revalidatePath('/favoriten')
  return { error: null }
}

export async function removeFavorite(jobRefnr: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('job_refnr', jobRefnr)

  if (error) return { error: 'Konnte nicht entfernt werden.' }

  revalidatePath('/favoriten')
  return { error: null }
}
