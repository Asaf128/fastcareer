import { getRedis } from '@/lib/redis'

// Rate-Limiter für teure KI-Aufrufe. Läuft über Upstash Redis (Fixed Window),
// damit das Limit über alle Serverless-Instanzen hinweg gilt. Eine In-Memory-
// Map existiert pro Instanz und vervielfacht das Limit bei Traffic-Spitzen.
// Ohne Upstash-Env-Vars (z. B. lokal) greift der In-Memory-Fallback.
const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 20

const requestLog = new Map<string, number[]>()

function isRateLimitedInMemory(key: string, maxRequests: number): boolean {
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

export async function isRateLimited(
  key: string,
  maxRequests = MAX_REQUESTS_PER_WINDOW
): Promise<boolean> {
  const redis = getRedis()
  if (redis) {
    try {
      const bucket = `ratelimit:${key}:${Math.floor(Date.now() / WINDOW_MS)}`
      const count = await redis.incr(bucket)
      if (count === 1) {
        // TTL großzügiger als das Fenster, damit der Key sicher aufgeräumt wird
        await redis.expire(bucket, Math.ceil((WINDOW_MS / 1000) * 2))
      }
      return count > maxRequests
    } catch (error) {
      console.error('Upstash-Rate-Limit fehlgeschlagen, nutze In-Memory-Fallback:', error)
    }
  }

  return isRateLimitedInMemory(key, maxRequests)
}
