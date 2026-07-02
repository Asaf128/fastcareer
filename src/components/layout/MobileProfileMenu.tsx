'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
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

/**
 * Vollbild-Overlay mit verblurrtem Seitenhintergrund. Wichtig: per Portal
 * direkt in <body> — im Header würde dessen backdrop-blur das fixed-Overlay
 * einfangen und es öffnete sich innerhalb der Navbar.
 */
export function MobileProfileMenu({ onClose }: MobileProfileMenuProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    // Hintergrund-Scroll sperren: overflow:hidden reicht auf iOS Safari nicht,
    // deshalb den Body fixieren und die Scroll-Position merken/wiederherstellen
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [onClose])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Profilmenü"
      className="bg-background/60 animate-fade-in fixed inset-0 z-50 flex flex-col backdrop-blur-xl sm:hidden"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-foreground font-display text-xl font-semibold uppercase">Menü</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Menü schließen"
          className="text-text-secondary hover:text-foreground rounded-lg p-1.5 transition-colors duration-150"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col items-center justify-center gap-9 pb-16">
        {MENU_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="text-foreground flex items-center gap-3 text-2xl font-medium"
          >
            <Icon className="text-accent h-6 w-6" />
            {label}
          </Link>
        ))}

        <form action={logout}>
          <button
            type="submit"
            className="text-text-secondary flex items-center gap-3 text-2xl font-medium"
          >
            <LogOut className="h-6 w-6" />
            Abmelden
          </button>
        </form>
      </nav>
    </div>,
    document.body
  )
}
