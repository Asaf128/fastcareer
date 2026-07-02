import type { WorkExperienceEntry, EducationEntry } from './profile.types'

export interface JobSummary {
  kurzbeschreibung: string
  aufgaben: string[]
  anforderungen: string[]
  benefits: string[]
  arbeitszeit: string | null
  standort: string | null
  unternehmen: string
}

export interface MatchScoreResult {
  score: number
  begruendung: string[]
}

export interface CvParseResult {
  full_name: string | null
  birth_date: string | null
  location: string | null
  headline: string | null
  about: string | null
  work_experience: WorkExperienceEntry[]
  education: EducationEntry[]
  skills: string[]
  languages: string[]
}
