import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import { APP_NAME } from '@/constants/config'
import { logout } from '@/actions/auth.actions'
import { createClient } from '@/lib/supabase/server'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="border-border bg-background/95 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <Link href="/" className="text-foreground font-display text-xl font-semibold uppercase">
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/favoriten"
                className="text-text-secondary hover:text-foreground flex items-center gap-1.5 text-sm transition-colors duration-150"
              >
                <Bookmark className="h-4 w-4" />
                Meine Merkliste
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-text-secondary hover:text-foreground text-sm transition-colors duration-150"
                >
                  Abmelden
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-foreground hover:bg-surface-dark inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
            >
              Anmelden
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
