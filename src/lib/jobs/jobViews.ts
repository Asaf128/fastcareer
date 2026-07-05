import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Loggt den Aufruf einer Job-Detailseite für das Admin-Analytics-Dashboard.
 * Bewusst fehlertolerant: Ein fehlgeschlagener Log-Eintrag (z. B. solange
 * die Migration noch nicht angewendet ist) darf die Seite nie blockieren.
 */
export async function recordJobView(
  supabase: SupabaseClient<Database>,
  userId: string,
  jobRefnr: string
): Promise<void> {
  const { error } = await supabase
    .from('job_views')
    .insert({ user_id: userId, job_refnr: jobRefnr })
  if (error) console.error('job_views-Insert fehlgeschlagen:', error.code)
}
