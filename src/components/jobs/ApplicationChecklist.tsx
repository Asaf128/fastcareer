'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { updateChecklist, saveNotes } from '@/actions/applications.actions'

interface ApplicationChecklistProps {
  jobRefnr: string
  titel: string
  arbeitgeber: string
  ort: string
  isAuthenticated: boolean
  initialApplied: boolean
  initialAnswered: boolean
  initialNotes: string
}

export function ApplicationChecklist({
  jobRefnr,
  titel,
  arbeitgeber,
  ort,
  isAuthenticated,
  initialApplied,
  initialAnswered,
  initialNotes,
}: ApplicationChecklistProps) {
  const [applied, setApplied] = useState(initialApplied)
  const [answered, setAnswered] = useState(initialAnswered)
  const [notes, setNotes] = useState(initialNotes)
  const [, startTransition] = useTransition()

  if (!isAuthenticated) {
    return (
      <div className="border-border bg-surface mt-6 rounded-xl border border-dashed p-6 text-center">
        <ClipboardList className="text-text-secondary mx-auto h-6 w-6" />
        <p className="text-text-secondary mt-2 text-sm">
          <Link href="/login" className="text-accent hover:underline">
            Melde dich an
          </Link>{' '}
          um deinen Bewerbungsstand zu verfolgen.
        </p>
      </div>
    )
  }

  function toggleApplied() {
    const next = !applied
    setApplied(next)
    startTransition(async () => {
      await updateChecklist({ jobRefnr, titel, arbeitgeber, ort, applied: next })
    })
  }

  function toggleAnswered() {
    const next = !answered
    setAnswered(next)
    startTransition(async () => {
      await updateChecklist({ jobRefnr, titel, arbeitgeber, ort, answered: next })
    })
  }

  function handleNotesBlur() {
    startTransition(async () => {
      await saveNotes({ jobRefnr, titel, arbeitgeber, ort, notes })
    })
  }

  return (
    <div className="border-border bg-background mt-6 rounded-xl border p-6 shadow-sm lg:p-8">
      <h2 className="text-foreground text-lg font-semibold">Dein Bewerbungsstand</h2>

      <div className="mt-4 flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={applied}
            onChange={toggleApplied}
            className="border-border h-4 w-4 rounded"
          />
          Beworben
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={answered}
            onChange={toggleAnswered}
            className="border-border h-4 w-4 rounded"
          />
          Geantwortet
        </label>
      </div>

      <label
        htmlFor={`notes-${jobRefnr}`}
        className="text-foreground mt-6 block text-sm font-medium"
      >
        Notizen
      </label>
      <textarea
        id={`notes-${jobRefnr}`}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        onBlur={handleNotesBlur}
        rows={4}
        placeholder="z. B. Gehaltsvorstellung, Ansprechpartner, nächste Schritte …"
        className="border-border bg-background text-text-primary mt-2 w-full rounded-lg border p-3 text-sm"
      />
    </div>
  )
}
