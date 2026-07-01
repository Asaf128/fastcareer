import Link from 'next/link'
import { Container } from '@/components/shared/Container'

export function Footer() {
  return (
    <footer className="border-border border-t py-8">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-text-secondary text-xs tracking-[0.2em] uppercase">
          © {new Date().getFullYear()} fastcareer
        </p>
        <nav className="flex gap-6">
          <Link
            href="/impressum"
            className="text-text-secondary hover:text-foreground text-xs tracking-[0.2em] uppercase transition-colors duration-300"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="text-text-secondary hover:text-foreground text-xs tracking-[0.2em] uppercase transition-colors duration-300"
          >
            Datenschutz
          </Link>
        </nav>
      </Container>
    </footer>
  )
}
