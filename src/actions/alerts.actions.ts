'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const alertSchema = z.object({
  was: z.string().min(2).max(100),
  wo: z.string().max(100).optional(),
  umkreis: z.number().int().min(0).max(200).optional(),
  arbeitszeit: z.string().max(10).optional(),
})

const MAX_ALERTS_PER_USER = 5

export async function createJobAlert(input: z.infer<typeof alertSchema>) {
  const parsed = alertSchema.safeParse(input)
  if (!parsed.success) return { error: 'Ungültige Suchkriterien.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  const { count } = await supabase
    .from('job_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= MAX_ALERTS_PER_USER) {
    return {
      error: `Maximal ${MAX_ALERTS_PER_USER} Job-Alerts möglich — lösche zuerst einen im Profil.`,
    }
  }

  const { error } = await supabase.from('job_alerts').upsert(
    {
      user_id: user.id,
      was: parsed.data.was,
      wo: parsed.data.wo ?? '',
      umkreis: parsed.data.umkreis ?? 25,
      arbeitszeit: parsed.data.arbeitszeit ?? '',
    },
    { onConflict: 'user_id,was,wo,arbeitszeit', ignoreDuplicates: true }
  )

  if (error) return { error: 'Job-Alert konnte nicht gespeichert werden.' }

  revalidatePath('/profil')
  return { error: null }
}

export async function deleteJobAlert(id: string) {
  if (!z.string().uuid().safeParse(id).success) return { error: 'Ungültige ID.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  const { error } = await supabase.from('job_alerts').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: 'Job-Alert konnte nicht gelöscht werden.' }

  revalidatePath('/profil')
  return { error: null }
}
