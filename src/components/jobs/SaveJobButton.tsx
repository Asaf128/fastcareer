'use client'

import { useState, useTransition } from 'react'
import { Star } from 'lucide-react'
import { saveApplication, removeApplication } from '@/actions/applications.actions'
import { cn } from '@/lib/cn'

interface SaveJobButtonProps {
  jobRefnr: string
  titel: string
  arbeitgeber: string
  ort: string
  initialIsSaved: boolean
  isAuthenticated: boolean
}

export function SaveJobButton({
  jobRefnr,
  titel,
  arbeitgeber,
  ort,
  initialIsSaved,
  isAuthenticated,
}: SaveJobButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isPopping, setIsPopping] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!isAuthenticated) return null

  function toggle() {
    const next = !isSaved
    setIsSaved(next)
    if (next) setIsPopping(true)

    startTransition(async () => {
      const result = next
        ? await saveApplication({ jobRefnr, titel, arbeitgeber, ort })
        : await removeApplication(jobRefnr)
      if (result.error) setIsSaved(!next)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      onAnimationEnd={() => setIsPopping(false)}
      disabled={isPending}
      aria-label={isSaved ? 'Von Bewerbungen entfernen' : 'Als Bewerbung speichern'}
      aria-pressed={isSaved ? 'true' : 'false'}
      className={cn(
        'relative z-10 flex shrink-0 items-center justify-center rounded-lg border p-2 transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.9] disabled:opacity-50 disabled:active:scale-100',
        isSaved
          ? 'border-warning text-warning'
          : 'border-border text-text-secondary hover:border-warning hover:text-warning',
        isPopping && 'animate-star-pop'
      )}
    >
      <Star className={cn('h-4 w-4', isSaved && 'fill-current')} />
    </button>
  )
}
