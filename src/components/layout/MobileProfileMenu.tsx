'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Bookmark, LogOut, User } from 'lucide-react'
import { logout } from '@/actions/auth.actions'

interface MobileProfileMenuProps {
  onClose: () => void
}

const MENU_LINKS = [
  { href: '/profil', label: 'Profil', icon: User },
  { href: '/bewerbungen', label: 'Bewerbungen', icon: Bookmark },
] as const

/**
 * Overlay mit verblurrtem Seitenhintergrund, beginnt unterhalb der Navbar —
 * der Fastcareer-Schriftzug bleibt sichtbar, geschlossen wird über das
 * X in der Navbar (HeaderNav) oder Escape. Wichtig: per Portal direkt in
 * <body> — im Header würde dessen backdrop-blur das fixed-Overlay einfangen
 * und es öffnete sich innerhalb der Navbar.
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
      // top-[65px] = Header-Höhe (h-16 + 1px Border) — die Navbar bleibt frei
      className="bg-background/60 animate-fade-in fixed inset-x-0 top-[65px] bottom-0 z-40 flex flex-col backdrop-blur-xl sm:hidden"
    >
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
