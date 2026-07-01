'use client'

import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, id, className, ...props },
  ref
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <div>
      <label htmlFor={textareaId} className="text-foreground block text-sm font-medium">
        {label}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
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
