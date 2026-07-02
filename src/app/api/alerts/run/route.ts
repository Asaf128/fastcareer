import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchJobs } from '@/lib/jobs/arbeitsagentur'
import { APP_URL } from '@/constants/config'
import type { Arbeitszeit, JobListing } from '@/types/job.types'

export const maxDuration = 300

const MAX_JOBS_PER_MAIL = 8

function renderAlertEmail(was: string, wo: string, jobs: JobListing[]): string {
  const items = jobs
    .map(
      (job) =>
        `<li style="margin-bottom:12px;"><a href="${APP_URL}/suche/${encodeURIComponent(job.refnr)}?titel=${encodeURIComponent(job.titel)}&arbeitgeber=${encodeURIComponent(job.arbeitgeber)}&ort=${encodeURIComponent(job.ort)}" style="color:#cc785c;font-weight:600;text-decoration:none;">${job.titel}</a><br><span style="color:#6b6459;font-size:13px;">${job.arbeitgeber}${job.ort ? ` · ${job.ort}` : ''}</span></li>`
    )
    .join('')

  return `<div style="font-family:Helvetica,Arial,sans-serif;color:#191919;max-width:560px;">
<p>Hallo,</p>
<p>für deinen Job-Alert <strong>${was}${wo ? ` in ${wo}` : ''}</strong> gibt es neue Stellenangebote:</p>
<ul style="padding-left:18px;">${items}</ul>
<p><a href="${APP_URL}/suche?was=${encodeURIComponent(was)}${wo ? `&wo=${encodeURIComponent(wo)}` : ''}" style="color:#cc785c;">Alle Treffer ansehen →</a></p>
<p style="color:#6b6459;font-size:12px;">Du bekommst diese Mail, weil du auf Fastcareer einen Job-Alert gespeichert hast. Löschen kannst du ihn jederzeit in deinem <a href="${APP_URL}/profil" style="color:#6b6459;">Profil</a>.</p>
</div>`
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: 'Fastcareer <jobs@asafcebeci.de>', to, subject, html }),
  })
  if (!response.ok) {
    console.error('Resend-Versand fehlgeschlagen:', response.status, await response.text())
  }
  return response.ok
}

export async function GET(request: Request) {
  // Nur der Vercel-Cron (bzw. wer das Secret kennt) darf den Versand anstoßen
  const authHeader = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY fehlt' }, { status: 500 })
  }

  const admin = createAdminClient()
  const { data: alerts, error } = await admin.from('job_alerts').select('*')
  if (error || !alerts) {
    return NextResponse.json({ error: 'Alerts nicht lesbar' }, { status: 500 })
  }

  let sent = 0
  for (const alert of alerts) {
    try {
      const { treffer } = await searchJobs({
        was: alert.was,
        wo: alert.wo || undefined,
        umkreis: alert.umkreis,
        arbeitszeit: (alert.arbeitszeit || undefined) as Arbeitszeit | undefined,
        size: MAX_JOBS_PER_MAIL,
        veroeffentlichtSeit: 1,
      })
      if (treffer.length === 0) continue

      const { data: userData } = await admin.auth.admin.getUserById(alert.user_id)
      const email = userData?.user?.email
      if (!email) continue

      const ok = await sendEmail(
        email,
        `${treffer.length} neue Jobs: ${alert.was}${alert.wo ? ` in ${alert.wo}` : ''}`,
        renderAlertEmail(alert.was, alert.wo, treffer)
      )
      if (ok) {
        sent += 1
        await admin
          .from('job_alerts')
          .update({ last_sent_at: new Date().toISOString() })
          .eq('id', alert.id)
      }
    } catch (alertError) {
      console.error(`Job-Alert ${alert.id} fehlgeschlagen:`, alertError)
    }
  }

  return NextResponse.json({ processed: alerts.length, sent })
}
