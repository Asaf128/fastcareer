'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Löscht alle Nutzerdaten (DSGVO Art. 17): Lebensläufe im Storage,
// Bewerbungen, Profil und zuletzt den Auth-User selbst. Läuft komplett über
// den Service-Role-Client, weil das Löschen des Auth-Users Admin-Rechte braucht.
export async function deleteAccount(): Promise<{ error: string } | never> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  let admin
  try {
    admin = createAdminClient()
  } catch (error) {
    console.error('Admin-Client nicht verfügbar:', error)
    return { error: 'Konto-Löschung ist derzeit nicht möglich. Bitte kontaktiere den Support.' }
  }

  const { data: cvFiles } = await admin.storage.from('cvs').list(user.id)
  if (cvFiles && cvFiles.length > 0) {
    const paths = cvFiles.map((file) => `${user.id}/${file.name}`)
    const { error: storageError } = await admin.storage.from('cvs').remove(paths)
    if (storageError) {
      console.error('Lebensläufe konnten nicht gelöscht werden:', storageError.message)
      return { error: 'Konto konnte nicht gelöscht werden. Bitte versuche es erneut.' }
    }
  }

  const { error: applicationsError } = await admin
    .from('applications')
    .delete()
    .eq('user_id', user.id)
  if (applicationsError) {
    console.error('Bewerbungen konnten nicht gelöscht werden:', applicationsError.code)
    return { error: 'Konto konnte nicht gelöscht werden. Bitte versuche es erneut.' }
  }

  const { error: profileError } = await admin.from('profiles').delete().eq('id', user.id)
  if (profileError) {
    console.error('Profil konnte nicht gelöscht werden:', profileError.code)
    return { error: 'Konto konnte nicht gelöscht werden. Bitte versuche es erneut.' }
  }

  const { error: authError } = await admin.auth.admin.deleteUser(user.id)
  if (authError) {
    console.error('Auth-User konnte nicht gelöscht werden:', authError.message)
    return { error: 'Konto konnte nicht gelöscht werden. Bitte versuche es erneut.' }
  }

  await supabase.auth.signOut()
  redirect('/')
}
