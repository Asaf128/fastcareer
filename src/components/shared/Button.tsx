'use client'

import { cn } from '@/lib/cn'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  isLoading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}

const variants = {
  primary:
    'bg-foreground text-[var(--text-on-dark)] hover:bg-[var(--surface-dark)] shadow-lg hover:shadow-xl',
  secondary:
    'bg-[var(--surface)] text-foreground hover:bg-[var(--surface-2)] border border-[var(--border)]',
  ghost: 'bg-transparent text-foreground hover:text-[var(--text-secondary)]',
  accent: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]',
}

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  isLoading,
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled ?? isLoading}
      className={cn(
        'cursor-pointer font-medium tracking-[0.15em] uppercase transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  )
}
