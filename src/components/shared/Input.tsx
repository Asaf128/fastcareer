'use client'

import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, ...props },
  ref
) {
  // useId statt Label-Slug: bei wiederholten Feldern (z. B. mehrere
  // Berufserfahrungs-Einträge) wären Label-basierte IDs mehrfach vergeben
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div>
      <label htmlFor={inputId} className="text-foreground block text-sm font-medium">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          'border-border bg-background text-text-primary mt-1.5 w-full rounded-lg border px-3 py-2 text-sm',
          error && 'border-error',
          className
        )}
        {...props}
      />
      {error && <p className="text-error mt-1 text-xs">{error}</p>}
    </div>
  )
})
