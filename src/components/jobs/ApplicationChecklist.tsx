'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { updateStatus, saveNotes } from '@/actions/applications.actions'
import { Textarea } from '@/components/shared/Textarea'
import { cn } from '@/lib/cn'
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from '@/types/application.types'

interface ApplicationChecklistProps {
  jobRefnr: string
  titel: string
  arbeitgeber: string
  ort: string
  isAuthenticated: boolean
  initialStatus: ApplicationStatus
  initialNotes: string
}

export function ApplicationChecklist({
  jobRefnr,
  titel,
  arbeitgeber,
  ort,
  isAuthenticated,
  initialStatus,
  initialNotes,
}: ApplicationChecklistProps) {
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus)
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

  function selectStatus(next: ApplicationStatus) {
    const previous = status
    setStatus(next)
    startTransition(async () => {
      const result = await updateStatus({ jobRefnr, titel, arbeitgeber, ort, status: next })
      if (result.error) {
        setStatus(previous)
        toast.error(result.error)
      }
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

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Bewerbungsstatus">
        {APPLICATION_STATUSES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => selectStatus(value)}
            aria-pressed={status === value ? 'true' : 'false'}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-150',
              status === value
                ? 'border-accent bg-accent text-white'
                : 'border-border text-text-secondary hover:border-accent hover:text-accent'
            )}
          >
            {APPLICATION_STATUS_LABELS[value]}
          </button>
        ))}
      </div>

      <Textarea
        label="Notizen"
        id={`notes-${jobRefnr}`}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        onBlur={handleNotesBlur}
        rows={4}
        placeholder="z. B. Gehaltsvorstellung, Ansprechpartner, nächste Schritte …"
        className="mt-8 sm:mt-6"
      />
    </div>
  )
}
