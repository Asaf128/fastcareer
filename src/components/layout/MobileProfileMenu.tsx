'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Bookmark, LogOut, User, X } from 'lucide-react'
import { logout } from '@/actions/auth.actions'

interface MobileProfileMenuProps {
  onClose: () => void
}

const MENU_LINKS = [
  { href: '/profil', label: 'Profil', icon: User },
  { href: '/bewerbungen', label: 'Bewerbungen', icon: Bookmark },
] as const

export function MobileProfileMenu({ onClose }: MobileProfileMenuProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    // Hintergrund-Scroll sperren, solange das Menü offen ist
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Profilmenü"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:hidden"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Menü schließen"
        className="animate-fade-in bg-foreground/30 absolute inset-0 backdrop-blur-md"
      />

      <div className="border-border bg-background animate-scale-in relative w-full max-w-xs rounded-2xl border p-2 shadow-xl">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-foreground font-display text-lg font-semibold uppercase">Menü</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menü schließen"
            className="text-text-secondary hover:text-foreground -mr-1 rounded-lg p-1.5 transition-colors duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-1 flex flex-col">
          {MENU_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="text-foreground hover:bg-surface flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors duration-150"
            >
              <Icon className="text-accent h-5 w-5" />
              {label}
            </Link>
          ))}

          <div className="border-border mx-4 my-1 border-t" />

          <form action={logout}>
            <button
              type="submit"
              className="text-text-secondary hover:bg-surface hover:text-foreground flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors duration-150"
            >
              <LogOut className="h-5 w-5" />
              Abmelden
            </button>
          </form>
        </nav>
      </div>
    </div>
  )
}
