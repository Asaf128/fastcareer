'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className, ...props },
  ref
) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div>
      <label htmlFor={inputId} className="text-foreground block text-sm font-medium">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
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
