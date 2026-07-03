import Link from 'next/link'
import { Container } from '@/components/shared/Container'

export function Footer() {
  return (
    <footer className="border-border border-t py-10 lg:py-12">
      <Container className="flex flex-row items-center justify-between gap-3">
        <p className="text-text-secondary text-xs sm:text-sm">
          © {new Date().getFullYear()} fastcareer
        </p>
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/impressum"
            className="text-text-secondary hover:text-foreground text-xs transition-colors duration-150 sm:text-sm"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="text-text-secondary hover:text-foreground text-xs transition-colors duration-150 sm:text-sm"
          >
            Datenschutz
          </Link>
          <Link
            href="/agb"
            className="text-text-secondary hover:text-foreground text-xs transition-colors duration-150 sm:text-sm"
          >
            AGB
          </Link>
        </nav>
      </Container>
    </footer>
  )
}
