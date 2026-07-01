import 'server-only'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service-Role-Client: bypasst RLS und darf Auth-Admin-Operationen ausführen.
// Ausschließlich für server-seitige Aufgaben, bei denen der eingeloggte
// User-Kontext bewusst nicht reicht (Cache-Inserts, Konto-Löschung).
// Niemals in Client-Komponenten importieren — 'server-only' erzwingt das.
export function createAdminClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY oder NEXT_PUBLIC_SUPABASE_URL nicht gesetzt.')
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
