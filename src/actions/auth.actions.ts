'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const emailSchema = z.object({
  email: z.string().email(),
})

const codeSchema = z.object({
  email: z.string().email(),
  token: z.string().regex(/^\d{6}$/),
})

export async function requestLoginCode(
  _prevState: { error: string | null; success: boolean; email: string },
  formData: FormData
) {
  const email = String(formData.get('email') ?? '')
  const parsed = emailSchema.safeParse({ email })

  if (!parsed.success) {
    return { error: 'Bitte eine gültige E-Mail-Adresse eingeben.', success: false, email }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: true },
  })

  if (error) {
    return {
      error: 'Anmeldung fehlgeschlagen. Bitte später erneut versuchen.',
      success: false,
      email,
    }
  }

  return { error: null, success: true, email: parsed.data.email }
}

export async function verifyLoginCode(_prevState: { error: string | null }, formData: FormData) {
  const parsed = codeSchema.safeParse({
    email: formData.get('email'),
    token: formData.get('token'),
  })

  if (!parsed.success) {
    return { error: 'Bitte den 6-stelligen Code eingeben.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: 'email',
  })

  if (error) {
    return { error: 'Code ungültig oder abgelaufen. Bitte neu anfordern.' }
  }

  redirect('/bewerbungen')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
