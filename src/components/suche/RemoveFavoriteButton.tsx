'use client'

import { useTransition } from 'react'
import { removeFavorite } from '@/actions/favorites.actions'

interface RemoveFavoriteButtonProps {
  jobRefnr: string
}

export function RemoveFavoriteButton({ jobRefnr }: RemoveFavoriteButtonProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await removeFavorite(jobRefnr)
        })
      }
      disabled={isPending}
      aria-label="Von Merkliste entfernen"
      className="border-border text-text-secondary hover:border-accent hover:text-accent relative z-10 shrink-0 border px-3 py-2 text-xs tracking-[0.15em] uppercase transition-colors duration-300 disabled:opacity-50"
    >
      Entfernen
    </button>
  )
}
