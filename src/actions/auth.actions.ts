'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { APP_URL } from '@/constants/config'
import { createClient } from '@/lib/supabase/server'

const emailSchema = z.object({
  email: z.string().email(),
})

export async function sendMagicLink(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
) {
  const parsed = emailSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return { error: 'Bitte eine gültige E-Mail-Adresse eingeben.', success: false }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${APP_URL}/auth/callback` },
  })

  if (error) {
    return { error: 'Anmeldung fehlgeschlagen. Bitte später erneut versuchen.', success: false }
  }

  return { error: null, success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
