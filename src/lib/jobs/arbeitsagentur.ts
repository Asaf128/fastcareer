import type { JobListing, JobSearchParams, JobSearchResult } from '@/types/job.types'

// v4 wurde von der Bundesagentur abgeschaltet (HTTP 403), v6 ist der
// aktuelle Endpunkt. Gleicher öffentlicher API-Key, aber anderes
// Antwortformat (ergebnisliste statt stellenangebote, andere Feldnamen).
const API_BASE = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs'
const API_KEY = 'jobboerse-jobsuche'

// Home-Office ist in v6 kein Arbeitszeit-Wert mehr, sondern ein eigener
// Filter: Stellen mit Prozent-Angabe (ab 1 %) plus "nach Vereinbarung".
const HOME_OFFICE_FILTER = 'prozentual_1;nv_true'

interface RawJobsResponse {
  ergebnisliste?: RawJobListing[]
  maxErgebnisse?: number
}

interface RawJobListing {
  referenznummer: string
  stellenangebotsTitel?: string
  hauptberuf?: string
  firma?: string
  externeURL?: string
  stellenlokationen?: {
    adresse?: {
      plz?: string
      ort?: string
      region?: string
    }
  }[]
  veroeffentlichungszeitraum?: { von?: string }
  datumErsteVeroeffentlichung?: string
}

export async function searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.size ?? 25),
  })
  // "was" ist bei der Arbeitsagentur-API kein Pflichtfeld — ein leerer Wert
  // führt sogar zu HTTP 400, deshalb nur setzen wenn wirklich vorhanden.
  // Ohne Stichwort filtert dann nur Ort/Umkreis/Arbeitszeit.
  if (params.was) query.set('was', params.was)
  if (params.wo) query.set('wo', params.wo)
  if (params.umkreis) query.set('umkreis', String(params.umkreis))
  // Ausbildung ist bei der Arbeitsagentur kein Arbeitszeit-Wert, sondern ein
  // eigener Angebotstyp (angebotsart=4 für Ausbildung/Duales Studium)
  if (params.arbeitszeit === 'ausbildung') {
    query.set('angebotsart', '4')
  } else if (params.arbeitszeit === 'ho') {
    query.set('homeoffice', HOME_OFFICE_FILTER)
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

  const treffer: JobListing[] = (data.ergebnisliste ?? [])
    .filter((job) => Boolean(job.referenznummer))
    .map((job) => {
      const adresse = job.stellenlokationen?.[0]?.adresse
      return {
        refnr: job.referenznummer,
        titel: job.stellenangebotsTitel ?? job.hauptberuf ?? '',
        beruf: job.hauptberuf ?? '',
        arbeitgeber: job.firma ?? '',
        ort: adresse?.ort ?? '',
        plz: adresse?.plz ?? '',
        region: adresse?.region ?? '',
        veroeffentlichungsdatum:
          job.veroeffentlichungszeitraum?.von ?? job.datumErsteVeroeffentlichung ?? '',
        externeUrl: job.externeURL,
      }
    })

  return { treffer, gesamtTreffer: data.maxErgebnisse ?? 0 }
}
