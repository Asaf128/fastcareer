import type { NextConfig } from 'next'

// 'unsafe-inline' bei script-src ist für Next.js-Inline-Bootstrapping nötig
// (nonce-basierte CSP bräuchte Middleware-Umbau); 'unsafe-eval' nur im Dev-
// Modus für HMR — deshalb wird die CSP nur in Production gesetzt.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  // Portfolio-Seite darf Fastcareer als Showcase einbetten; alle anderen bleiben blockiert.
  // Kein X-Frame-Options mehr: das kann keine fremden Origins erlauben und würde
  // frame-ancestors in älteren Browsern widersprechen — moderne ignorieren XFO ohnehin,
  // sobald frame-ancestors gesetzt ist.
  "frame-ancestors 'self' https://asafcebeci.de https://www.asafcebeci.de",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }]
    : []),
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
