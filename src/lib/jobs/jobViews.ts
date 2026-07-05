import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Refnr ist ein roher URL-Parameter — BA-Referenznummern bestehen aus
// Ziffern/Buchstaben/Bindestrichen (z. B. "10000-1201370366-S")
const REFNR_PATTERN = /^[\w-]{1,64}$/

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
  if (!REFNR_PATTERN.test(jobRefnr)) return
  const { error } = await supabase
    .from('job_views')
    .insert({ user_id: userId, job_refnr: jobRefnr })
  if (error) console.error('job_views-Insert fehlgeschlagen:', error.code)
}
