'use client'

import { useState, useTransition } from 'react'
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
      aria-pressed={isFavorite}
      className={cn(
        'relative z-10 shrink-0 border px-3 py-2 text-xs tracking-[0.15em] uppercase transition-colors duration-300 disabled:opacity-50',
        isFavorite
          ? 'border-accent bg-accent text-white'
          : 'border-border text-text-secondary hover:border-accent hover:text-accent'
      )}
    >
      {isFavorite ? 'Gemerkt' : 'Merken'}
    </button>
  )
}
