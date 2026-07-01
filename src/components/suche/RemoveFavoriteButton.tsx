'use client'

import { useTransition } from 'react'
import { BookmarkX } from 'lucide-react'
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
      className="border-border text-text-secondary hover:border-accent hover:text-accent relative z-10 flex shrink-0 items-center justify-center rounded-lg border p-2 transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.9] disabled:opacity-50 disabled:active:scale-100"
    >
      <BookmarkX className="h-4 w-4" />
    </button>
  )
}
