import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const displayFont = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '700'],
})

const bodyFont = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: { default: 'Starter — Projektbeschreibung', template: '%s | Starter' },
  description: '150-160 Zeichen Beschreibung mit Hauptkeyword.',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Starter',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="bg-background text-text-primary antialiased">
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
