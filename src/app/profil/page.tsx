import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { createClient } from '@/lib/supabase/server'

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

  return (
    <Section className="py-10 lg:py-14">
      <Container className="max-w-2xl">
        <h1 className="text-foreground text-2xl lg:text-3xl">Mein Profil</h1>
        <p className="text-text-secondary mt-1 mb-8 text-sm">
          Diese Daten nutzen wir, um für dich maßgeschneiderte Anschreiben zu erstellen.
        </p>

        <ProfileForm initialProfile={profile} />
      </Container>
    </Section>
  )
}
