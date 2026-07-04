export type Arbeitszeit = 'vz' | 'tz' | 'snw' | 'ho' | 'mj' | 'ausbildung'

export interface JobSearchParams {
  /** Leer = kein Stichwort-Filter, dann zählen nur Ort/Umkreis/Arbeitszeit */
  was: string
  wo?: string
  umkreis?: number
  page?: number
  size?: number
  arbeitszeit?: Arbeitszeit
  /** Nur Angebote der letzten N Tage (Arbeitsagentur-Param veroeffentlichtseit) */
  veroeffentlichtSeit?: number
}

export interface JobListing {
  refnr: string
  titel: string
  beruf: string
  arbeitgeber: string
  ort: string
  plz: string
  region: string
  veroeffentlichungsdatum: string
  externeUrl?: string
}

export interface JobSearchResult {
  treffer: JobListing[]
  gesamtTreffer: number
}

export interface JobDetail {
  refnr: string
  beschreibung: string
  kontaktEmail: string | null
  quelleUrl: string
}

export interface LocalitySuggestion {
  plz: string
  ort: string
  bundesland: string
}
