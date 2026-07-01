const GERMAN_MONTHS: Record<string, string> = {
  januar: '01',
  jan: '01',
  februar: '02',
  feb: '02',
  märz: '03',
  maerz: '03',
  mär: '03',
  april: '04',
  apr: '04',
  mai: '05',
  juni: '06',
  jun: '06',
  juli: '07',
  jul: '07',
  august: '08',
  aug: '08',
  september: '09',
  sep: '09',
  sept: '09',
  oktober: '10',
  okt: '10',
  november: '11',
  nov: '11',
  dezember: '12',
  dez: '12',
}

/** Normalisiert von der KI gelieferte Monats-Angaben (Berufserfahrung/Ausbildung) auf das von `<input type="month">` erwartete Format YYYY-MM. Gibt null zurück, wenn sich kein Monat erkennen lässt, statt einen kaputten String zu übernehmen, den das Feld ohnehin nicht anzeigen würde. */
export function normalizeMonthDate(raw: string | null): string | null {
  if (!raw) return null
  const value = raw.trim()

  const isoMatch = value.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/)
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}`

  const slashMatch = value.match(/^(\d{1,2})[./](\d{4})$/)
  if (slashMatch) return `${slashMatch[2]}-${slashMatch[1]!.padStart(2, '0')}`

  const germanMatch = value.toLowerCase().match(/^([a-zäöü]+)\s+(\d{4})$/)
  if (germanMatch) {
    const monthNumber = GERMAN_MONTHS[germanMatch[1]!]
    if (monthNumber) return `${germanMatch[2]}-${monthNumber}`
  }

  const yearOnlyMatch = value.match(/^(\d{4})$/)
  if (yearOnlyMatch) return `${yearOnlyMatch[1]}-01`

  return null
}

/** Normalisiert das Geburtsdatum auf YYYY-MM-DD, wie es `<input type="date">` erwartet. */
export function normalizeIsoDate(raw: string | null): string | null {
  if (!raw) return null
  const value = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value

  const germanDateMatch = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (germanDateMatch) {
    const day = germanDateMatch[1]!.padStart(2, '0')
    const month = germanDateMatch[2]!.padStart(2, '0')
    const year = germanDateMatch[3]
    return `${year}-${month}-${day}`
  }

  return null
}
