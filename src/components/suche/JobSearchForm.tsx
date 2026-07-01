'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/lib/cn'
import type { LocalitySuggestion } from '@/types/job.types'

interface JobSearchFormProps {
  defaultWas: string
  defaultWo: string
  defaultUmkreis: number
}

let debounceTimer: ReturnType<typeof setTimeout>

export function JobSearchForm({ defaultWas, defaultWo, defaultUmkreis }: JobSearchFormProps) {
  const [wo, setWo] = useState(defaultWo)
  const [orte, setOrte] = useState<LocalitySuggestion[]>([])
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)

  function handleOrtChange(value: string) {
    setWo(value)
    clearTimeout(debounceTimer)

    if (value.trim().length < 2) {
      setOrte([])
      setIsSuggestionsOpen(false)
      return
    }

    debounceTimer = setTimeout(async () => {
      const response = await fetch(`/api/orte?q=${encodeURIComponent(value)}`)
      const data = (await response.json()) as { orte: LocalitySuggestion[] }
      setOrte(data.orte)
      setIsSuggestionsOpen(true)
    }, 300)
  }

  function selectOrt(suggestion: LocalitySuggestion) {
    setWo(suggestion.ort)
    setIsSuggestionsOpen(false)
  }

  return (
    <form action="/suche" className="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <input
        type="text"
        name="was"
        defaultValue={defaultWas}
        placeholder="Beruf oder Stichwort"
        required
        className="border-border bg-surface text-foreground rounded-none border px-4 py-3 text-sm sm:col-span-2"
      />

      <div className="relative">
        <input
          type="text"
          name="wo"
          value={wo}
          onChange={(e) => handleOrtChange(e.target.value)}
          onFocus={() => orte.length > 0 && setIsSuggestionsOpen(true)}
          onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 150)}
          placeholder="Ort oder PLZ"
          autoComplete="off"
          className="border-border bg-surface text-foreground w-full rounded-none border px-4 py-3 text-sm"
        />
        {isSuggestionsOpen && orte.length > 0 && (
          <ul className="border-border bg-background absolute z-10 mt-1 w-full border shadow-lg">
            {orte.map((ort) => (
              <li key={`${ort.ort}-${ort.plz}`}>
                <button
                  type="button"
                  onClick={() => selectOrt(ort)}
                  className={cn(
                    'hover:bg-surface w-full px-4 py-2 text-left text-sm',
                    'text-text-secondary'
                  )}
                >
                  {ort.ort} <span className="text-xs">({ort.plz})</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <select
        name="umkreis"
        defaultValue={defaultUmkreis}
        className="border-border bg-surface text-foreground rounded-none border px-4 py-3 text-sm"
      >
        <option value={5}>5 km</option>
        <option value={10}>10 km</option>
        <option value={25}>25 km</option>
        <option value={50}>50 km</option>
        <option value={100}>100 km</option>
      </select>

      <Button type="submit" className="sm:col-span-4">
        Jobs suchen
      </Button>
    </form>
  )
}
