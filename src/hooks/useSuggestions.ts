'use client'

import { useRef, useState } from 'react'

/**
 * Debounced Autocomplete-State für ein Eingabefeld: ruft `fetcher` frühestens
 * 300 ms nach dem letzten Tastendruck auf (ab 2 Zeichen) und verwaltet die
 * Sichtbarkeit der Vorschlagsliste.
 */
export function useSuggestions<T>(fetcher: (query: string) => Promise<T[]>) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [suggestions, setSuggestions] = useState<T[]>([])
  const [isOpen, setIsOpen] = useState(false)

  function onQueryChange(value: string) {
    clearTimeout(timerRef.current)

    if (value.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    timerRef.current = setTimeout(async () => {
      try {
        const results = await fetcher(value)
        setSuggestions(results)
        setIsOpen(results.length > 0)
      } catch {
        setSuggestions([])
        setIsOpen(false)
      }
    }, 300)
  }

  function close() {
    setIsOpen(false)
  }

  function openIfAvailable() {
    if (suggestions.length > 0) setIsOpen(true)
  }

  return { suggestions, isOpen, onQueryChange, close, openIfAvailable }
}
