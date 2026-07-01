import type { Database } from './database'

export type Application = Database['public']['Tables']['applications']['Row']
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert']
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update']

export const APPLICATION_STATUSES = [
  'gespeichert',
  'beworben',
  'interview',
  'zusage',
  'absage',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  gespeichert: 'Gespeichert',
  beworben: 'Beworben',
  interview: 'Interview',
  zusage: 'Zusage',
  absage: 'Absage',
}
