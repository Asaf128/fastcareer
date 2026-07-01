'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/shared/Input'
import type { EducationEntry } from '@/types/profile.types'

interface EducationFieldsProps {
  entries: EducationEntry[]
  onChange: (entries: EducationEntry[]) => void
}

const emptyEntry: EducationEntry = {
  abschluss: '',
  einrichtung: '',
  von: '',
  bis: null,
}

export function EducationFields({ entries, onChange }: EducationFieldsProps) {
  function updateEntry(index: number, patch: Partial<EducationEntry>) {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)))
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index))
  }

  return (
    <div>
      <h3 className="text-foreground text-sm font-semibold">Ausbildung</h3>

      <div className="mt-3 space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="border-border relative rounded-lg border p-4">
            <button
              type="button"
              onClick={() => removeEntry(index)}
              aria-label="Ausbildungsstation entfernen"
              className="text-text-secondary hover:text-error absolute top-3 right-3"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="grid gap-3 pr-8 sm:grid-cols-2">
              <Input
                label="Abschluss"
                value={entry.abschluss}
                onChange={(event) => updateEntry(index, { abschluss: event.target.value })}
              />
              <Input
                label="Einrichtung"
                value={entry.einrichtung}
                onChange={(event) => updateEntry(index, { einrichtung: event.target.value })}
              />
              <Input
                label="Von"
                type="month"
                value={entry.von}
                onChange={(event) => updateEntry(index, { von: event.target.value })}
              />
              <Input
                label="Bis"
                type="month"
                value={entry.bis ?? ''}
                onChange={(event) => updateEntry(index, { bis: event.target.value || null })}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...entries, { ...emptyEntry }])}
        className="text-accent mt-3 flex items-center gap-1.5 text-sm font-medium"
      >
        <Plus className="h-4 w-4" />
        Ausbildung hinzufügen
      </button>
    </div>
  )
}
