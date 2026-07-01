'use client'

import { useRef, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { cn } from '@/lib/cn'
import type { LocalitySuggestion } from '@/types/job.types'

interface JobSearchFormProps {
  defaultWas: string
  defaultWo: string
  defaultUmkreis: number
  defaultArbeitszeit?: string
  popularSearches?: string[]
}

let debounceTimer: ReturnType<typeof setTimeout>

export function JobSearchForm({
  defaultWas,
  defaultWo,
  defaultUmkreis,
  defaultArbeitszeit = '',
  popularSearches,
}: JobSearchFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const wasInputRef = useRef<HTMLInputElement>(null)
  const [wo, setWo] = useState(defaultWo)
  const [orte, setOrte] = useState<LocalitySuggestion[]>([])
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const [arbeitszeit, setArbeitszeit] = useState(defaultArbeitszeit)
  const isHomeOffice = arbeitszeit === 'ho'

  function selectPopularSearch(suche: string) {
    if (wasInputRef.current) wasInputRef.current.value = suche
    formRef.current?.requestSubmit()
  }

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
    <form
      ref={formRef}
      action="/suche"
      className="border-border bg-background rounded-xl border p-3 shadow-sm sm:p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="text-text-secondary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            ref={wasInputRef}
            type="text"
            name="was"
            aria-label="Beruf oder Stichwort"
            defaultValue={defaultWas}
            placeholder="Beruf oder Stichwort"
            required
            className="border-border bg-surface text-foreground w-full rounded-lg border py-2.5 pr-4 pl-9 text-sm"
          />
        </div>

        <div className="relative">
          <MapPin className="text-text-secondary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            name="wo"
            aria-label="Ort oder PLZ"
            value={isHomeOffice ? '' : wo}
            onChange={(e) => handleOrtChange(e.target.value)}
            onFocus={() => orte.length > 0 && setIsSuggestionsOpen(true)}
            onBlur={() => setTimeout(() => setIsSuggestionsOpen(false), 150)}
            placeholder={isHomeOffice ? 'Bundesweit' : 'Ort oder PLZ'}
            autoComplete="off"
            disabled={isHomeOffice}
            className="border-border bg-surface text-foreground w-full rounded-lg border py-2.5 pr-4 pl-9 text-sm disabled:opacity-50"
          />
          {isSuggestionsOpen && orte.length > 0 && (
            <ul className="border-border bg-background animate-scale-in absolute z-10 mt-1 w-full rounded-lg border py-1 shadow-lg">
              {orte.map((ort) => (
                <li key={`${ort.ort}-${ort.plz}`}>
                  <button
                    type="button"
                    onClick={() => selectOrt(ort)}
                    className={cn(
                      'hover:bg-surface w-full px-4 py-2 text-left text-sm transition-colors duration-150',
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
          aria-label="Umkreis"
          defaultValue={defaultUmkreis}
          disabled={isHomeOffice}
          className="border-border bg-surface text-foreground rounded-lg border px-3 py-2.5 text-sm disabled:opacity-50"
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={25}>25 km</option>
          <option value={50}>50 km</option>
          <option value={100}>100 km</option>
        </select>

        <select
          name="arbeitszeit"
          aria-label="Arbeitszeit"
          value={arbeitszeit}
          onChange={(e) => setArbeitszeit(e.target.value)}
          className="border-border bg-surface text-foreground rounded-lg border px-3 py-2.5 text-sm sm:col-span-2"
        >
          <option value="">Arbeitszeit: alle</option>
          <option value="vz">Vollzeit</option>
          <option value="tz">Teilzeit</option>
          <option value="ho">Home-Office</option>
          <option value="snw">Schicht/Nacht/Wochenende</option>
        </select>

        <Button type="submit" className="sm:col-span-2">
          <Search className="h-4 w-4" />
          Jobs suchen
        </Button>
      </div>

      {popularSearches && popularSearches.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-text-secondary text-sm">Beliebte Suchen:</span>
          {popularSearches.map((suche) => (
            <button
              key={suche}
              type="button"
              onClick={() => selectPopularSearch(suche)}
              className="border-border text-text-secondary hover:border-accent hover:text-accent rounded-full border px-3 py-1 text-sm transition-colors duration-150"
            >
              {suche}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
