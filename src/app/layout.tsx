import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import './globals.css'

const displayFont = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700'],
})

const bodyFont = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: { default: 'Fastcareer — Jobs finden in Sekunden', template: '%s | Fastcareer' },
  description:
    'Fastcareer durchsucht offene Stellen der Arbeitsagentur nach Beruf und Ort — schnell, übersichtlich, ohne Umwege.',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Fastcareer',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="bg-background text-text-primary antialiased">
        <Header />
        {children}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
