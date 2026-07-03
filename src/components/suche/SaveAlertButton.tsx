'use client'

import { useState, useTransition } from 'react'
import { BellPlus, BellRing } from 'lucide-react'
import { toast } from 'sonner'
import { createJobAlert } from '@/actions/alerts.actions'

interface SaveAlertButtonProps {
  was: string
  wo: string
  umkreis: number
  arbeitszeit: string
}

export function SaveAlertButton({ was, wo, umkreis, arbeitszeit }: SaveAlertButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await createJobAlert({ was, wo, umkreis, arbeitszeit })
      if (result.error) {
        toast.error(result.error)
        return
      }
      setIsSaved(true)
      toast.success('Job-Alert gespeichert, wir mailen dir neue Treffer.')
    })
  }

  if (isSaved) {
    return (
      <span className="text-success flex items-center gap-1.5 text-sm">
        <BellRing className="h-4 w-4" />
        Job-Alert aktiv
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={isPending}
      className="border-border text-text-secondary hover:border-accent hover:text-accent flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors duration-150 disabled:opacity-60"
    >
      <BellPlus className="h-4 w-4" />
      Als Job-Alert speichern
    </button>
  )
}
