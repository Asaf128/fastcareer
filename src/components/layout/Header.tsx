import Link from 'next/link'
import { APP_NAME } from '@/constants/config'
import { isAdminUser } from '@/lib/adminAccess'
import { getAuthUser } from '@/lib/supabase/server'
import { HeaderNav } from '@/components/layout/HeaderNav'

export async function Header() {
  const user = await getAuthUser()

  return (
    <header className="border-border bg-background/95 sticky top-0 z-20 border-b backdrop-blur">
      {/* Feste Höhe (h-16 + 1px Border): die Hero-Sektion rechnet exakt
          dagegen, damit unten nichts von der nächsten Sektion durchblitzt */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link href="/" className="text-foreground font-display text-xl font-semibold uppercase">
          {APP_NAME}
        </Link>

        <HeaderNav isAuthenticated={!!user} isAdmin={isAdminUser(user?.email)} />
      </div>
    </header>
  )
}
