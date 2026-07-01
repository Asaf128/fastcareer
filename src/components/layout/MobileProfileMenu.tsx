'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Bookmark, LogOut, User, X } from 'lucide-react'
import { logout } from '@/actions/auth.actions'

interface MobileProfileMenuProps {
  onClose: () => void
}

export function MobileProfileMenu({ onClose }: MobileProfileMenuProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="bg-background animate-fade-in fixed inset-0 z-50 flex flex-col sm:hidden">
      <div className="border-border flex items-center justify-between border-b px-6 py-4">
        <span className="text-foreground font-display text-xl font-semibold uppercase">Menü</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Menü schließen"
          className="text-text-secondary hover:text-foreground"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col items-center justify-center gap-8">
        <Link
          href="/profil"
          onClick={onClose}
          className="text-foreground flex items-center gap-3 text-xl font-medium"
        >
          <User className="h-5 w-5" />
          Profil
        </Link>
        <Link
          href="/bewerbungen"
          onClick={onClose}
          className="text-foreground flex items-center gap-3 text-xl font-medium"
        >
          <Bookmark className="h-5 w-5" />
          Bewerbungen
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="text-foreground flex items-center gap-3 text-xl font-medium"
          >
            <LogOut className="h-5 w-5" />
            Abmelden
          </button>
        </form>
      </nav>
    </div>
  )
}
