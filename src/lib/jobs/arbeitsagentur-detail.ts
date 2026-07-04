import * as cheerio from 'cheerio'
import type { JobDetail } from '@/types/job.types'

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

interface NgStateJson {
  jobdetail?: {
    stellenangebotsBeschreibung?: string
  }
  arbeitgeberdarstellung?: {
    kontaktinformationen?: string
  }
}

export async function getJobDetail(refnr: string): Promise<JobDetail> {
  const quelleUrl = `https://www.arbeitsagentur.de/jobsuche/jobdetail/${refnr}`

  const response = await fetch(quelleUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Job-Detail konnte nicht geladen werden: ${response.status}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)
  const ngStateRaw = $('#ng-state').text()

  let beschreibung = ''
  let kontaktEmail: string | null = null

  if (ngStateRaw) {
    try {
      const state = JSON.parse(ngStateRaw) as NgStateJson
      beschreibung = state.jobdetail?.stellenangebotsBeschreibung ?? ''
      const kontaktinformationen = state.arbeitgeberdarstellung?.kontaktinformationen
      // Viele Arbeitgeber nennen die Bewerbungs-Mail nur im Fließtext der
      // Beschreibung statt im separaten Kontakt-Feld — daher als Fallback
      // dort ebenfalls suchen, sonst bleibt der "Per Mail senden"-Button bei
      // den meisten Stellen unsichtbar
      const emailMatch =
        kontaktinformationen?.match(EMAIL_PATTERN) ?? beschreibung.match(EMAIL_PATTERN)
      kontaktEmail = emailMatch?.[0] ?? null
    } catch {
      // ng-state konnte nicht geparst werden, Beschreibung/Kontakt bleiben leer,
      // Nutzer wird auf quelleUrl verwiesen
    }
  }

  return { refnr, beschreibung, kontaktEmail, quelleUrl }
}
