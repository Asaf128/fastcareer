import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { Section } from '@/components/shared/Section'

export const metadata: Metadata = {
  title: 'Danke für deinen Kauf',
  robots: { index: false, follow: false },
}

// Bewusst keine Gutschrift-Logik hier: Die Credits schreibt ausschließlich
// der Stripe-Webhook gut — diese Seite ist nur die freundliche Bestätigung.
export default function CreditsDankePage() {
  return (
    <Section className="py-16 lg:py-24">
      <Container className="max-w-xl text-center">
        <CheckCircle2 className="text-success mx-auto h-12 w-12" />
        <h1 className="text-foreground mt-4 text-2xl lg:text-3xl">Danke für deinen Kauf!</h1>
        <p className="text-text-secondary mt-3 text-sm lg:text-base">
          Deine Zahlung war erfolgreich. Die Credits werden dir in wenigen Augenblicken
          gutgeschrieben — du kannst direkt weitersuchen. Die Rechnung bekommst du per E-Mail von
          Stripe.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/suche"
            className="bg-accent hover:bg-accent-dark inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
          >
            Weiter zur Jobsuche
          </Link>
          <Link
            href="/credits"
            className="border-border text-foreground hover:bg-surface inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors duration-150"
          >
            Guthaben ansehen
          </Link>
        </div>
      </Container>
    </Section>
  )
}
