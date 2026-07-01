'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserCircle } from 'lucide-react'
import { logout } from '@/actions/auth.actions'
import { MobileProfileMenu } from '@/components/layout/MobileProfileMenu'

interface HeaderNavProps {
  isAuthenticated: boolean
}

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
      <nav className="hidden items-center gap-4 sm:flex">
        <Link
          href="/profil"
          className="text-text-secondary hover:text-foreground text-sm transition-colors duration-150"
        >
          Profil
        </Link>
        <Link
          href="/bewerbungen"
          className="text-text-secondary hover:text-foreground text-sm transition-colors duration-150"
        >
          Bewerbungen
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="text-text-secondary hover:text-foreground text-sm transition-colors duration-150"
          >
            Abmelden
          </button>
        </form>
      </nav>

      <button
        type="button"
        onClick={() => setIsMenuOpen(true)}
        aria-label="Profilmenü öffnen"
        className="text-text-secondary hover:text-foreground flex items-center justify-center sm:hidden"
      >
        <UserCircle className="h-6 w-6" />
      </button>

      {isMenuOpen && <MobileProfileMenu onClose={() => setIsMenuOpen(false)} />}
    </>
  )
}
