'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/shared/Input'
import { Textarea } from '@/components/shared/Textarea'
import type { WorkExperienceEntry } from '@/types/profile.types'

interface WorkExperienceFieldsProps {
  entries: WorkExperienceEntry[]
  onChange: (entries: WorkExperienceEntry[]) => void
}

const emptyEntry: WorkExperienceEntry = {
  position: '',
  firma: '',
  von: '',
  bis: null,
  beschreibung: '',
}

export function WorkExperienceFields({ entries, onChange }: WorkExperienceFieldsProps) {
  function updateEntry(index: number, patch: Partial<WorkExperienceEntry>) {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)))
  }

  function removeEntry(index: number) {
    onChange(entries.filter((_, i) => i !== index))
  }

  return (
    <div>
      <h3 className="text-foreground text-sm font-semibold">Berufserfahrung</h3>

      <div className="mt-3 space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="border-border relative rounded-lg border p-4">
            <button
              type="button"
              onClick={() => removeEntry(index)}
              aria-label="Station entfernen"
              className="text-text-secondary hover:text-error absolute top-3 right-3"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="grid gap-3 pr-8 sm:grid-cols-2">
              <Input
                label="Position"
                value={entry.position}
                onChange={(event) => updateEntry(index, { position: event.target.value })}
              />
              <Input
                label="Firma"
                value={entry.firma}
                onChange={(event) => updateEntry(index, { firma: event.target.value })}
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

            <Textarea
              label="Beschreibung"
              value={entry.beschreibung}
              onChange={(event) => updateEntry(index, { beschreibung: event.target.value })}
              rows={3}
              className="mt-3"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...entries, { ...emptyEntry }])}
        className="text-accent mt-3 flex items-center gap-1.5 text-sm font-medium"
      >
        <Plus className="h-4 w-4" />
        Station hinzufügen
      </button>
    </div>
  )
}
