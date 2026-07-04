import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { DeleteAccountSection } from '@/components/profile/DeleteAccountSection'
import { CreditsSection } from '@/components/profile/CreditsSection'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import { getCreditBalance, type CreditFeature } from '@/lib/credits'
import { isProUser } from '@/lib/pro'
import { peekPeriodRemaining } from '@/lib/usage'

export const metadata: Metadata = {
  title: 'Mein Profil',
}

export default async function ProfilPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login?next=/profil')

  const supabase = await createClient()
  const isPro = isProUser(user.email)
  // Unabhängige Abfragen parallel statt nacheinander
  const [{ data: profile }, balance, summaryRemaining, matchRemaining, letterRemaining] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      getCreditBalance(),
      isPro ? Promise.resolve(null) : peekPeriodRemaining('summary', user.id),
      isPro ? Promise.resolve(null) : peekPeriodRemaining('match', user.id),
      isPro ? Promise.resolve(null) : peekPeriodRemaining('letter', user.id),
    ])
  const freeRemaining: Record<CreditFeature, number> | null =
    summaryRemaining !== null && matchRemaining !== null && letterRemaining !== null
      ? { summary: summaryRemaining, match: matchRemaining, letter: letterRemaining }
      : null

  // Signed URL, weil der cvs-Bucket privat ist (1 h gültig, reicht für die Seite)
  let cvUrl: string | null = null
  if (profile?.cv_path) {
    const { data: signed } = await supabase.storage
      .from('cvs')
      .createSignedUrl(profile.cv_path, 3600)
    cvUrl = signed?.signedUrl ?? null
  }

  return (
    <Section className="py-10 lg:py-14">
      <Container className="max-w-2xl">
        <h1 className="text-foreground text-2xl lg:text-3xl">Mein Profil</h1>
        <p className="text-text-secondary mt-1 mb-8 text-sm">
          Diese Daten nutzen wir, um für dich maßgeschneiderte Anschreiben zu erstellen.
        </p>

        <ProfileForm initialProfile={profile} cvUrl={cvUrl} />
        <CreditsSection balance={balance} isPro={isPro} freeRemaining={freeRemaining} />
        <DeleteAccountSection />
      </Container>
    </Section>
  )
}
