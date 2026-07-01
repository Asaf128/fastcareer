import type { Metadata } from 'next'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Anmelden',
}

export default function LoginPage() {
  return (
    <Section className="flex flex-1 flex-col justify-center py-14 lg:py-20">
      <Container className="max-w-md text-center">
        <div className="border-border bg-background rounded-xl border p-8 shadow-sm">
          <h1 className="text-foreground text-2xl">Anmelden</h1>
          <p className="text-text-secondary mt-2 mb-6 text-sm">
            Kein Passwort nötig — wir schicken dir einen Anmelde-Code per E-Mail.
          </p>
          <LoginForm />
        </div>
      </Container>
    </Section>
  )
}
