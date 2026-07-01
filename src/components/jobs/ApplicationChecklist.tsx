'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { updateChecklist, saveNotes } from '@/actions/applications.actions'
import { Checkbox } from '@/components/shared/Checkbox'
import { Textarea } from '@/components/shared/Textarea'

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
        <Checkbox label="Beworben" checked={applied} onChange={toggleApplied} />
        <Checkbox label="Geantwortet" checked={answered} onChange={toggleAnswered} />
      </div>

      <Textarea
        label="Notizen"
        id={`notes-${jobRefnr}`}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        onBlur={handleNotesBlur}
        rows={4}
        placeholder="z. B. Gehaltsvorstellung, Ansprechpartner, nächste Schritte …"
        className="mt-6"
      />
    </div>
  )
}
