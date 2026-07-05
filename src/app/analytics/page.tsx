import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { AnalyticsStats } from '@/components/analytics/AnalyticsStats'
import { UsersTable } from '@/components/analytics/UsersTable'
import { isAdminUser } from '@/lib/adminAccess'
import { loadAdminAnalytics } from '@/lib/adminAnalytics'
import { getAuthUser } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false, follow: false },
}

export default async function AnalyticsPage() {
  const user = await getAuthUser()
  // notFound statt redirect: Nicht-Admins sollen nicht mal erfahren, dass es die Seite gibt
  if (!user || !isAdminUser(user.email)) notFound()

  const { stats, users } = await loadAdminAnalytics()

  return (
    <Section className="py-10 lg:py-14">
      <Container>
        <h1 className="text-foreground text-2xl lg:text-3xl">Analytics</h1>
        <p className="text-text-secondary mt-1 mb-6 text-sm">
          Alle registrierten Nutzer und ihre Aktivität — Bewerbungen, Matches, Anschreiben und
          Credits. Nur für Admins sichtbar.
        </p>

        <AnalyticsStats stats={stats} />

        <div className="mt-6">
          <UsersTable users={users} />
        </div>
      </Container>
    </Section>
  )
}
