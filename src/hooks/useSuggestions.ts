'use client'

import { useRef, useState } from 'react'

// Kurzes Debounce: lang genug, um nicht jeden Tastendruck zu feuern,
// kurz genug, dass die Vorschläge als "sofort" wahrgenommen werden
const DEBOUNCE_MS = 100

/**
 * Autocomplete-State für ein Eingabefeld. Damit es sich nach Echtzeit
 * anfühlt: bereits geladene Ergebnisse werden pro Query gecacht und ohne
 * Wartezeit angezeigt (z. B. beim Zurücklöschen), verspätete Antworten
 * älterer Queries werden verworfen, und die bisherige Liste bleibt sichtbar,
 * während die nächste lädt.
 */
export function useSuggestions<T>(fetcher: (query: string) => Promise<T[]>) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const latestQueryRef = useRef('')
  const cacheRef = useRef(new Map<string, T[]>())
  const [suggestions, setSuggestions] = useState<T[]>([])
  const [isOpen, setIsOpen] = useState(false)

  function onQueryChange(value: string) {
    const query = value.trim().toLowerCase()
    latestQueryRef.current = query
    clearTimeout(timerRef.current)

    if (query.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const cached = cacheRef.current.get(query)
    if (cached) {
      setSuggestions(cached)
      setIsOpen(cached.length > 0)
      return
    }

    timerRef.current = setTimeout(async () => {
      try {
        const results = await fetcher(query)
        cacheRef.current.set(query, results)
        // Antwort einer inzwischen überholten Query nicht mehr anzeigen
        if (latestQueryRef.current !== query) return
        setSuggestions(results)
        setIsOpen(results.length > 0)
      } catch {
        if (latestQueryRef.current !== query) return
        setSuggestions([])
        setIsOpen(false)
      }
    }, DEBOUNCE_MS)
  }

  function close() {
    setIsOpen(false)
  }

  function openIfAvailable() {
    if (suggestions.length > 0) setIsOpen(true)
  }

  return { suggestions, isOpen, onQueryChange, close, openIfAvailable }
}
