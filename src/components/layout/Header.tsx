import Link from 'next/link'
import { APP_NAME } from '@/constants/config'
import { createClient } from '@/lib/supabase/server'
import { HeaderNav } from '@/components/layout/HeaderNav'

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

        <HeaderNav isAuthenticated={!!user} />
      </div>
    </header>
  )
}
