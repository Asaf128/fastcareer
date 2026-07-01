import Link from 'next/link'
import { APP_NAME } from '@/constants/config'
import { logout } from '@/actions/auth.actions'
import { createClient } from '@/lib/supabase/server'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="border-border border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <Link href="/" className="text-foreground text-lg tracking-[0.1em] uppercase">
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/favoriten"
                className="text-text-secondary hover:text-foreground text-xs tracking-[0.2em] uppercase transition-colors duration-300"
              >
                Meine Merkliste
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-text-secondary hover:text-foreground text-xs tracking-[0.2em] uppercase transition-colors duration-300"
                >
                  Abmelden
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="text-text-secondary hover:text-foreground text-xs tracking-[0.2em] uppercase transition-colors duration-300"
            >
              Anmelden
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
