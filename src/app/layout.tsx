import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
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
  // og:image kommt aus src/app/opengraph-image.tsx (Next-Konvention)
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Fastcareer',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="bg-background text-text-primary flex min-h-screen flex-col antialiased">
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
        <Toaster position="bottom-right" richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
