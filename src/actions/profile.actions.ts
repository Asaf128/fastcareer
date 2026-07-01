'use server'

import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseCv } from '@/lib/ai/parseCv'
import type { CvParseResult } from '@/types/ai.types'

const workExperienceSchema = z.object({
  position: z.string().min(1),
  firma: z.string().min(1),
  von: z.string().min(1),
  bis: z.string().nullable(),
  beschreibung: z.string(),
})

const educationSchema = z.object({
  abschluss: z.string().min(1),
  einrichtung: z.string().min(1),
  von: z.string().min(1),
  bis: z.string().nullable(),
})

const profileSchema = z.object({
  fullName: z.string().max(200),
  birthDate: z.string().max(20),
  location: z.string().max(200),
  headline: z.string().max(200),
  about: z.string().max(2000),
  workExperience: z.array(workExperienceSchema).max(50),
  education: z.array(educationSchema).max(50),
  skills: z.array(z.string().min(1).max(60)).max(50),
  languages: z.array(z.string().min(1).max(60)).max(20),
})

export async function updateProfile(input: z.infer<typeof profileSchema>) {
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) return { error: 'Ungültige Profildaten.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: parsed.data.fullName || null,
    birth_date: parsed.data.birthDate || null,
    location: parsed.data.location || null,
    headline: parsed.data.headline || null,
    about: parsed.data.about || null,
    work_experience: parsed.data.workExperience,
    education: parsed.data.education,
    skills: parsed.data.skills,
    languages: parsed.data.languages,
  })

  if (error) return { error: 'Profil konnte nicht gespeichert werden.' }

  revalidatePath('/profil')
  return { error: null }
}

const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024

export async function uploadAndParseCv(
  formData: FormData
): Promise<{ error: string } | { error: null; parsed: CvParseResult }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  const file = formData.get('cv')
  if (!(file instanceof File)) return { error: 'Keine Datei erhalten.' }
  if (file.type !== 'application/pdf') return { error: 'Nur PDF-Dateien werden unterstützt.' }
  if (file.size > MAX_CV_SIZE_BYTES) return { error: 'Datei ist zu groß (max. 10 MB).' }

  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')

  let parsed: CvParseResult
  try {
    parsed = await parseCv(base64)
  } catch (error) {
    console.error('Lebenslauf-Auslesen fehlgeschlagen:', error)
    return { error: 'Lebenslauf konnte nicht ausgelesen werden. Bitte versuche es erneut.' }
  }

  const path = `${user.id}/${randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('cvs')
    .upload(path, arrayBuffer, { contentType: 'application/pdf', upsert: false })

  if (uploadError) {
    console.error('CV-Upload fehlgeschlagen:', uploadError.message)
    return { error: 'Lebenslauf konnte nicht gespeichert werden.' }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, cv_path: path })

  if (profileError) {
    console.error('CV-Pfad konnte nicht gespeichert werden:', profileError.code)
  }

  return { error: null, parsed }
}
