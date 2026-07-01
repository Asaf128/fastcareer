import type { LocalitySuggestion } from '@/types/job.types'

const API_BASE = 'https://openplzapi.org/de/Localities'

interface RawLocality {
  postalCode: string
  name: string
  federalState: { name: string }
}

export async function suggestLocations(query: string): Promise<LocalitySuggestion[]> {
  if (query.trim().length < 2) return []

  const params = new URLSearchParams({ name: query, page: '1', pageSize: '15' })
  const response = await fetch(`${API_BASE}?${params.toString()}`, {
    next: { revalidate: 86400 },
  })

  if (!response.ok) return []

  const data = (await response.json()) as RawLocality[]

  const seen = new Set<string>()
  const suggestions: LocalitySuggestion[] = []
  for (const locality of data) {
    const key = `${locality.name}-${locality.postalCode}`
    if (seen.has(key)) continue
    seen.add(key)
    suggestions.push({
      plz: locality.postalCode,
      ort: locality.name,
      bundesland: locality.federalState.name,
    })
  }

  return suggestions
}
