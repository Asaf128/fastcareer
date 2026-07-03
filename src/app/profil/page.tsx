import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { DeleteAccountSection } from '@/components/profile/DeleteAccountSection'
import { CreditsSection } from '@/components/profile/CreditsSection'
import { createClient } from '@/lib/supabase/server'
import { getCreditBalance } from '@/lib/credits'
import { isProUser } from '@/lib/pro'

export const metadata: Metadata = {
  title: 'Mein Profil',
}

export default async function ProfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/profil')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Signed URL, weil der cvs-Bucket privat ist (1 h gültig, reicht für die Seite)
  let cvUrl: string | null = null
  if (profile?.cv_path) {
    const { data: signed } = await supabase.storage
      .from('cvs')
      .createSignedUrl(profile.cv_path, 3600)
    cvUrl = signed?.signedUrl ?? null
  }

  const balance = await getCreditBalance()

  return (
    <Section className="py-10 lg:py-14">
      <Container className="max-w-2xl">
        <h1 className="text-foreground text-2xl lg:text-3xl">Mein Profil</h1>
        <p className="text-text-secondary mt-1 mb-8 text-sm">
          Diese Daten nutzen wir, um für dich maßgeschneiderte Anschreiben zu erstellen.
        </p>

        <ProfileForm initialProfile={profile} cvUrl={cvUrl} />
        <CreditsSection balance={balance} isPro={isProUser(user.email)} />
        <DeleteAccountSection />
      </Container>
    </Section>
  )
}
