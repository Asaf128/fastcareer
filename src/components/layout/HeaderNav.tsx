'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bookmark, Loader2, LogOut, User, UserCircle, X } from 'lucide-react'
import { logout } from '@/actions/auth.actions'
import { MobileProfileMenu } from '@/components/layout/MobileProfileMenu'
import { cn } from '@/lib/cn'

interface HeaderNavProps {
  isAuthenticated: boolean
}

const NAV_LINKS = [
  { href: '/profil', label: 'Profil', icon: User },
  { href: '/bewerbungen', label: 'Bewerbungen', icon: Bookmark },
] as const

export function HeaderNav({ isAuthenticated }: HeaderNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  // Welcher Link geklickt wurde — nur der bekommt den Spinner, isPending
  // allein würde nicht verraten welches Ziel gemeint ist
  const [pendingHref, setPendingHref] = useState<string | null>(null)

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

  // Eigene Navigation statt <Link>: die Navbar bleibt über Seitenwechsel
  // hinweg gemountet, dadurch kann sie sofortiges Feedback (Spinner, dezentes
  // Dimmen) zeigen, statt dass ein Klick kommentarlos ins Leere zu laufen scheint
  function navigateTo(href: string) {
    if (href === pathname) return
    setPendingHref(href)
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <>
      <nav className="bg-surface border-border hidden items-center gap-1 rounded-full border p-1 sm:flex">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          const isLoading = isPending && pendingHref === href
          return (
            <button
              key={href}
              type="button"
              onClick={() => navigateTo(href)}
              disabled={isPending}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 disabled:cursor-default',
                isActive
                  ? 'text-foreground bg-background'
                  : 'text-text-secondary hover:text-foreground hover:bg-background',
                isPending && !isLoading && 'opacity-60'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              {label}
            </button>
          )
        })}
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
