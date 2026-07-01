import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Anmelden',
}

export default function LoginPage() {
  return (
    <Section className="py-14 lg:py-20">
      <Container className="max-w-md">
        <div className="border-border bg-background rounded-xl border p-8 shadow-sm">
          <div className="bg-accent/10 text-accent mb-5 flex h-11 w-11 items-center justify-center rounded-lg">
            <Mail className="h-5 w-5" />
          </div>
          <h1 className="text-foreground text-2xl">Anmelden</h1>
          <p className="text-text-secondary mt-2 mb-6 text-sm">
            Kein Passwort nötig — wir schicken dir einen Anmelde-Link per E-Mail.
          </p>
          <LoginForm />
        </div>
      </Container>
    </Section>
  )
}
