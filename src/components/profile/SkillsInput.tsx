'use client'

import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface SkillsInputProps {
  label: string
  values: string[]
  onChange: (values: string[]) => void
}

export function SkillsInput({ label, values, onChange }: SkillsInputProps) {
  const [draft, setDraft] = useState('')
  const inputId = label.toLowerCase().replace(/\s+/g, '-')

  function addValue() {
    const trimmed = draft.trim()
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed])
    setDraft('')
  }

  function removeValue(value: string) {
    onChange(values.filter((entry) => entry !== value))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addValue()
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className="text-foreground block text-sm font-medium">
        {label}
      </label>
      {values.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="bg-surface text-text-primary flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                aria-label={`${value} entfernen`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        id={inputId}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addValue}
        placeholder="Eingeben und Enter drücken"
        className="border-border bg-background text-text-primary mt-2 w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  )
}
