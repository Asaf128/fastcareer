const SUGGEST_URL =
  'https://rest.arbeitsagentur.de/jobboerse/suggest-service/ed/v2/jobsuche/vorschlaege'
const API_KEY = 'jobboerse-jobsuche'

interface RawVorschlag {
  vorschlag?: string
}

/**
 * Offizielle Berufsbezeichnungen der Jobbörse als Autocomplete-Vorschläge —
 * derselbe Suggest-Service, den auch arbeitsagentur.de/jobsuche nutzt.
 */
export async function suggestBerufe(query: string): Promise<string[]> {
  const url = `${SUGGEST_URL}?suchbegriff=${encodeURIComponent(query)}`

  const response = await fetch(url, {
    headers: { 'X-API-Key': API_KEY },
    next: { revalidate: 86400 },
  })

  if (!response.ok) return []

  const data = (await response.json()) as RawVorschlag[]
  if (!Array.isArray(data)) return []

  const seen = new Set<string>()
  const berufe: string[] = []
  for (const item of data) {
    const vorschlag = item.vorschlag?.trim()
    if (!vorschlag || seen.has(vorschlag)) continue
    seen.add(vorschlag)
    berufe.push(vorschlag)
    if (berufe.length >= 6) break
  }
  return berufe
}
