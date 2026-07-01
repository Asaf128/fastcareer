'use client'

import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, id, className, ...props },
  ref
) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId

  return (
    <label htmlFor={checkboxId} className="flex items-center gap-2 text-sm">
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        className={cn('border-border h-4 w-4 rounded', className)}
        {...props}
      />
      {label}
    </label>
  )
})
