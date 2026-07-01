import type { Metadata } from 'next'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Anmelden',
}

export default function LoginPage() {
  return (
    <Section className="py-16 lg:py-24">
      <Container className="max-w-md">
        <h1 className="text-foreground text-4xl">Anmelden</h1>
        <div className="bg-accent mt-4 mb-8 h-px w-16" />
        <p className="text-text-secondary mb-8 text-sm">
          Kein Passwort nötig — wir schicken dir einen Anmelde-Link per E-Mail.
        </p>
        <LoginForm />
      </Container>
    </Section>
  )
}
