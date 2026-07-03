'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, LogOut, User, UserCircle, X } from 'lucide-react'
import { logout } from '@/actions/auth.actions'
import { MobileProfileMenu } from '@/components/layout/MobileProfileMenu'

interface HeaderNavProps {
  isAuthenticated: boolean
}

const NAV_LINKS = [
  { href: '/profil', label: 'Profil', icon: User },
  { href: '/bewerbungen', label: 'Bewerbungen', icon: Bookmark },
] as const

export function HeaderNav({ isAuthenticated }: HeaderNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!isAuthenticated) {
    return (
      <nav className="flex items-center gap-4">
        <Link
          href="/login"
          className="bg-foreground hover:bg-surface-dark inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
        >
          Anmelden
        </Link>
      </nav>
    )
  }

  return (
    <>
      <nav className="bg-surface border-border hidden items-center gap-1 rounded-full border p-1 sm:flex">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="text-text-secondary hover:text-foreground hover:bg-background flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
        <div className="bg-border mx-1 h-4 w-px" aria-hidden />
        <form action={logout}>
          <button
            type="submit"
            className="text-text-secondary hover:bg-error/10 hover:text-error flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150"
          >
            <LogOut className="h-3.5 w-3.5" />
            Abmelden
          </button>
        </form>
      </nav>

      {/* Umschalter: das Menü liegt unterhalb der Navbar, geschlossen wird hier */}
      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label={isMenuOpen ? 'Profilmenü schließen' : 'Profilmenü öffnen'}
        aria-expanded={isMenuOpen}
        className="text-text-secondary hover:text-foreground flex items-center justify-center sm:hidden"
      >
        {isMenuOpen ? <X className="h-6 w-6" /> : <UserCircle className="h-6 w-6" />}
      </button>

      {isMenuOpen && <MobileProfileMenu onClose={() => setIsMenuOpen(false)} />}
    </>
  )
}
