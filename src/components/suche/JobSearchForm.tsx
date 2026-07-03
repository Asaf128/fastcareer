'use client'

import { useRef, useState } from 'react'
import { ChevronDown, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { PopularSearchesCarousel } from '@/components/suche/PopularSearchesCarousel'
import { SuggestionList } from '@/components/suche/SuggestionList'
import { useSuggestions } from '@/hooks/useSuggestions'
import { saveRecentSearch } from '@/lib/recentSearches'
import type { LocalitySuggestion } from '@/types/job.types'

interface JobSearchFormProps {
  defaultWas: string
  defaultWo: string
  defaultUmkreis: number
  defaultArbeitszeit?: string
  popularSearches?: string[]
}

// Erkennt gängige Schreibweisen für Home-Office als Suchbegriff:
// "Homeoffice", "Home Office", "Home-Office", "HO" (case-insensitive)
const HOME_OFFICE_PATTERN = /^(home[\s-]?office|ho)$/i

function isHomeOfficeQuery(value: string): boolean {
  return HOME_OFFICE_PATTERN.test(value.trim())
}

async function fetchBerufe(query: string): Promise<string[]> {
  const response = await fetch(`/api/berufe?q=${encodeURIComponent(query)}`)
  const data = (await response.json()) as { berufe: string[] }
  return data.berufe
}

async function fetchOrte(query: string): Promise<LocalitySuggestion[]> {
  const response = await fetch(`/api/orte?q=${encodeURIComponent(query)}`)
  const data = (await response.json()) as { orte: LocalitySuggestion[] }
  return data.orte
}

export function JobSearchForm({
  defaultWas,
  defaultWo,
  defaultUmkreis,
  defaultArbeitszeit = 'vz',
  popularSearches,
}: JobSearchFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const wasInputRef = useRef<HTMLInputElement>(null)
  const [was, setWas] = useState(defaultWas)
  const [wo, setWo] = useState(defaultWo)
  const [arbeitszeit, setArbeitszeit] = useState(defaultArbeitszeit)
  const berufe = useSuggestions(fetchBerufe)
  const orte = useSuggestions(fetchOrte)
  const isHomeOffice = arbeitszeit === 'ho'

  function selectPopularSearch(suche: string) {
    setWas(suche)
    if (isHomeOfficeQuery(suche)) setArbeitszeit('ho')
    // DOM-Wert direkt setzen: der Submit läuft, bevor React neu gerendert hat
    if (wasInputRef.current) wasInputRef.current.value = suche
    formRef.current?.requestSubmit()
  }

  function handleSubmit() {
    // Läuft vor der GET-Navigation zu /suche, merkt sich die Suche lokal
    saveRecentSearch({
      was: wasInputRef.current?.value.trim() ?? was.trim(),
      wo: isHomeOffice ? '' : wo,
    })
  }

  return (
    <>
      <form
        ref={formRef}
        action="/suche"
        onSubmit={handleSubmit}
        className="border-border bg-background rounded-xl border p-3 shadow-sm sm:p-4"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="relative col-span-2">
            <Search className="text-text-secondary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              ref={wasInputRef}
              type="text"
              name="was"
              aria-label="Beruf oder Stichwort"
              value={was}
              onChange={(e) => {
                setWas(e.target.value)
                berufe.onQueryChange(e.target.value)
                // "Homeoffice"/"HO" etc. als Beruf eingetippt: automatisch wie
                // Arbeitszeit "Home-Office" behandeln (Ort/Umkreis ausgrauen)
                if (isHomeOfficeQuery(e.target.value)) setArbeitszeit('ho')
              }}
              onFocus={berufe.openIfAvailable}
              onBlur={() => setTimeout(berufe.close, 150)}
              placeholder="Beruf oder Stichwort"
              autoComplete="off"
              required
              className="border-border bg-surface text-foreground w-full rounded-lg border py-2.5 pr-4 pl-9 text-base sm:text-sm"
            />
            {berufe.isOpen && (
              <SuggestionList
                items={berufe.suggestions.map((beruf) => ({ key: beruf, label: beruf }))}
                onSelect={(beruf) => {
                  setWas(beruf)
                  if (isHomeOfficeQuery(beruf)) setArbeitszeit('ho')
                  berufe.close()
                }}
              />
            )}
          </div>

          <div className="relative col-span-2 sm:col-span-1">
            <MapPin className="text-text-secondary pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              name="wo"
              aria-label="Ort oder PLZ"
              value={isHomeOffice ? '' : wo}
              onChange={(e) => {
                setWo(e.target.value)
                orte.onQueryChange(e.target.value)
              }}
              onFocus={orte.openIfAvailable}
              onBlur={() => setTimeout(orte.close, 150)}
              placeholder={isHomeOffice ? 'Bundesweit' : 'Ort oder PLZ'}
              autoComplete="off"
              disabled={isHomeOffice}
              className="border-border bg-surface text-foreground w-full rounded-lg border py-2.5 pr-4 pl-9 text-base disabled:opacity-50 sm:text-sm"
            />
            {orte.isOpen && (
              <SuggestionList
                items={orte.suggestions.map((ort) => ({
                  key: `${ort.ort}-${ort.plz}`,
                  label: ort.ort,
                  hint: `(${ort.plz})`,
                  value: ort.ort,
                }))}
                onSelect={(ortName) => {
                  setWo(ortName)
                  orte.close()
                }}
              />
            )}
          </div>

          <div className="relative">
            <select
              name="umkreis"
              aria-label="Umkreis"
              defaultValue={defaultUmkreis}
              disabled={isHomeOffice}
              className="border-border bg-surface text-foreground w-full appearance-none rounded-lg border py-2.5 pr-8 pl-3 text-base disabled:opacity-50 sm:text-sm"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
            <ChevronDown className="text-text-secondary pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2" />
          </div>

          <div className="relative sm:col-span-2">
            <select
              name="arbeitszeit"
              aria-label="Arbeitszeit"
              value={arbeitszeit}
              onChange={(e) => setArbeitszeit(e.target.value)}
              className="border-border bg-surface text-foreground w-full appearance-none rounded-lg border py-2.5 pr-8 pl-3 text-base sm:text-sm"
            >
              <option value="vz">Vollzeit</option>
              <option value="tz">Teilzeit</option>
              <option value="mj">Minijob</option>
              <option value="ausbildung">Ausbildung</option>
              <option value="ho">Home-Office</option>
            </select>
            <ChevronDown className="text-text-secondary pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2" />
          </div>

          <Button type="submit" variant="accent" className="col-span-2">
            <Search className="h-4 w-4" />
            Jobs suchen
          </Button>
        </div>
      </form>

      {popularSearches && popularSearches.length > 0 && (
        <PopularSearchesCarousel searches={popularSearches} onSelect={selectPopularSearch} />
      )}
    </>
  )
}
