'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallbackHref: string
  children: React.ReactNode
}

export function BackButton({ fallbackHref, children }: BackButtonProps) {
  const router = useRouter()

  function handleClick() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-text-secondary hover:text-foreground flex items-center gap-1.5 text-sm transition-colors duration-150"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </button>
  )
}
