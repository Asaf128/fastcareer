'use client'

interface SuggestionItem {
  key: string
  label: string
  /** Grauer Zusatz hinter dem Label, z. B. die PLZ */
  hint?: string
  /** Wert der bei Auswahl übergeben wird — Default: label */
  value?: string
}

interface SuggestionListProps {
  items: SuggestionItem[]
  onSelect: (value: string) => void
}

/** Dropdown unter einem Eingabefeld für Autocomplete-Vorschläge. */
export function SuggestionList({ items, onSelect }: SuggestionListProps) {
  if (items.length === 0) return null

  return (
    <ul className="border-border bg-background animate-scale-in absolute z-10 mt-1 w-full rounded-lg border py-1 shadow-lg">
      {items.map((item) => (
        <li key={item.key}>
          <button
            type="button"
            onClick={() => onSelect(item.value ?? item.label)}
            className="text-text-secondary hover:bg-surface w-full px-4 py-2 text-left text-sm transition-colors duration-150"
          >
            {item.label} {item.hint && <span className="text-xs">{item.hint}</span>}
          </button>
        </li>
      ))}
    </ul>
  )
}
