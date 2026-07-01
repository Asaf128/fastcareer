'use client'

import { useState, useTransition } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { addFavorite, removeFavorite } from '@/actions/favorites.actions'
import { cn } from '@/lib/cn'

interface FavoriteButtonProps {
  jobRefnr: string
  titel: string
  arbeitgeber: string
  ort: string
  initialIsFavorite: boolean
  isAuthenticated: boolean
}

export function FavoriteButton({
  jobRefnr,
  titel,
  arbeitgeber,
  ort,
  initialIsFavorite,
  isAuthenticated,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isPending, startTransition] = useTransition()

  if (!isAuthenticated) return null

  function toggle() {
    const next = !isFavorite
    setIsFavorite(next)
    startTransition(async () => {
      const result = next
        ? await addFavorite({ jobRefnr, titel, arbeitgeber, ort })
        : await removeFavorite(jobRefnr)
      if (result.error) setIsFavorite(!next)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={isFavorite ? 'Von Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
      aria-pressed={isFavorite ? 'true' : 'false'}
      className={cn(
        'relative z-10 flex shrink-0 items-center justify-center rounded-lg border p-2 transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.9] disabled:opacity-50 disabled:active:scale-100',
        isFavorite
          ? 'border-accent bg-accent text-white'
          : 'border-border text-text-secondary hover:border-accent hover:text-accent'
      )}
    >
      {isFavorite ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
    </button>
  )
}
