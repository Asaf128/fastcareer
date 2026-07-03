export interface RecentSearch {
  was: string
  wo: string
}

const STORAGE_KEY = 'fastcareer:recent-searches'
const MAX_ENTRIES = 5

export function readRecentSearches(): RecentSearch[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (entry): entry is RecentSearch =>
          typeof entry === 'object' &&
          entry !== null &&
          typeof (entry as RecentSearch).was === 'string' &&
          typeof (entry as RecentSearch).wo === 'string'
      )
      .slice(0, MAX_ENTRIES)
  } catch {
    return []
  }
}

// Snapshot-Cache für useSyncExternalStore: muss bei unverändertem
// localStorage dieselbe Referenz liefern, sonst rendert React endlos
let cachedRaw: string | null | undefined
let cachedSnapshot: RecentSearch[] = []

export function getRecentSearchesSnapshot(): RecentSearch[] {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedSnapshot = readRecentSearches()
  }
  return cachedSnapshot
}

const EMPTY: RecentSearch[] = []

export function getServerSearchesSnapshot(): RecentSearch[] {
  return EMPTY
}

export function subscribeToRecentSearches(onChange: () => void): () => void {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

export function saveRecentSearch(search: RecentSearch): void {
  if (!search.was.trim()) return
  try {
    const existing = readRecentSearches().filter(
      (entry) => !(entry.was === search.was && entry.wo === search.wo)
    )
    const next = [search, ...existing].slice(0, MAX_ENTRIES)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage kann fehlen (Private Mode), Suche funktioniert trotzdem
  }
}
