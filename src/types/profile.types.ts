import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface WorkExperienceEntry {
  position: string
  firma: string
  von: string
  bis: string | null
  beschreibung: string
}

export interface EducationEntry {
  abschluss: string
  einrichtung: string
  von: string
  bis: string | null
}
