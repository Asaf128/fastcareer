// Einfacher In-Memory-Sliding-Window-Limiter für teure KI-Aufrufe ohne Login.
// Der job_summaries-Cache begrenzt Gemini-Calls bereits auf 1x pro Job global —
// dieser Guard schützt zusätzlich gegen kurzfristige Bursts über viele neue
// Job-Refs. Zurückgesetzt bei Redeploy/Cold-Start; für höhere Anforderungen
// auf Upstash Redis umstellen (siehe 03-security.md §6).
const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 20

const requestLog = new Map<string, number[]>()

export function isRateLimited(key: string, maxRequests = MAX_REQUESTS_PER_WINDOW): boolean {
  const now = Date.now()
  const timestamps = (requestLog.get(key) ?? []).filter((t) => now - t < WINDOW_MS)

  if (timestamps.length >= maxRequests) {
    requestLog.set(key, timestamps)
    return true
  }

  timestamps.push(now)
  requestLog.set(key, timestamps)
  return false
}
