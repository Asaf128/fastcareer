'use client'

import { useState, useTransition } from 'react'
import { TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { deleteAccount } from '@/actions/account.actions'
import { Button } from '@/components/shared/Button'

export function DeleteAccountSection() {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccount()
      // Bei Erfolg wird server-seitig redirected — hierher kommt nur der Fehlerfall
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <div className="border-error/30 mt-12 rounded-xl border p-6">
      <h2 className="text-foreground text-base font-semibold">Konto löschen</h2>
      <p className="text-text-secondary mt-1 text-sm">
        Löscht dein Profil, alle gespeicherten Bewerbungen und hochgeladenen Lebensläufe
        unwiderruflich.
      </p>

      {isConfirming ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-error flex items-center gap-1.5 text-sm font-medium">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            Wirklich löschen? Das kann nicht rückgängig gemacht werden.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsConfirming(false)}
              disabled={isPending}
            >
              Abbrechen
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              isLoading={isPending}
              className="bg-error hover:bg-error/80 text-white"
            >
              Endgültig löschen
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => setIsConfirming(true)}
        >
          Konto löschen …
        </Button>
      )}
    </div>
  )
}
