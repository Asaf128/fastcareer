import type { JobListing, JobSearchParams, JobSearchResult } from '@/types/job.types'

const API_BASE = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs'
const API_KEY = 'jobboerse-jobsuche'

interface RawJobsResponse {
  stellenangebote?: RawJobListing[]
  maxErgebnisse?: number
}

interface RawJobListing {
  refnr: string
  titel: string
  beruf: string
  arbeitgeber: string
  externeUrl?: string
  arbeitsort?: {
    plz?: string
    ort?: string
    region?: string
  }
  aktuelleVeroeffentlichungsdatum?: string
}

export async function searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
  const query = new URLSearchParams({
    was: params.was,
    page: String(params.page ?? 1),
    size: String(params.size ?? 25),
  })
  if (params.wo) query.set('wo', params.wo)
  if (params.umkreis) query.set('umkreis', String(params.umkreis))
  // Ausbildung ist bei der Arbeitsagentur kein Arbeitszeit-Wert, sondern ein
  // eigener Angebotstyp (angebotsart=4 für Ausbildung/Duales Studium)
  if (params.arbeitszeit === 'ausbildung') {
    query.set('angebotsart', '4')
  } else if (params.arbeitszeit) {
    query.set('arbeitszeit', params.arbeitszeit)
  }
  if (params.veroeffentlichtSeit)
    query.set('veroeffentlichtseit', String(params.veroeffentlichtSeit))

  const response = await fetch(`${API_BASE}?${query.toString()}`, {
    headers: { 'X-API-Key': API_KEY },
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Arbeitsagentur-Suche fehlgeschlagen: ${response.status}`)
  }

  const data = (await response.json()) as RawJobsResponse

  const treffer: JobListing[] = (data.stellenangebote ?? []).map((job) => ({
    refnr: job.refnr,
    titel: job.titel,
    beruf: job.beruf,
    arbeitgeber: job.arbeitgeber,
    ort: job.arbeitsort?.ort ?? '',
    plz: job.arbeitsort?.plz ?? '',
    region: job.arbeitsort?.region ?? '',
    veroeffentlichungsdatum: job.aktuelleVeroeffentlichungsdatum ?? '',
    externeUrl: job.externeUrl,
  }))

  return { treffer, gesamtTreffer: data.maxErgebnisse ?? 0 }
}
