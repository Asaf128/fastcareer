export type Arbeitszeit = 'vz' | 'tz' | 'snw' | 'ho'

export interface JobSearchParams {
  was: string
  wo?: string
  umkreis?: number
  page?: number
  size?: number
  arbeitszeit?: Arbeitszeit
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
