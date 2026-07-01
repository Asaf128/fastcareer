import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://example.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/impressum`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/datenschutz`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
