import { cache } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

/**
 * Angemeldeten Nutzer einmal pro Request abfragen — mit React `cache()`
 * memoisiert, damit z. B. Header UND die jeweilige Seite (beide eigene
 * Server Components im selben Render-Baum) sich einen Netzwerk-Roundtrip
 * zu Supabase Auth teilen, statt ihn beide separat auszulösen. Das
 * Middleware-getUser() (Session-Refresh, anderer Runtime-Kontext) bleibt
 * davon unberührt und läuft weiterhin einmal pro Navigation.
 */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
