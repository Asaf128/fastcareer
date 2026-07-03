import { getRedis } from '@/lib/redis'

/**
 * Freemium-Tageskontingente: 3 Nutzungen pro Feature und Tag, getrennt
 * gezählt (Zusammenfassung, Match, Anschreiben, CV-Analyse). Suche und
 * Original-Anzeigen bleiben immer frei. Angemeldete Nutzer zählen per
 * User-ID, anonyme per IP (Schnupper-Kontingent).
 */
export const DAILY_LIMIT = 3

export type UsageFeature = 'summary' | 'match' | 'letter' | 'cv'

export interface UsageResult {
  allowed: boolean
  /** Verbleibende Nutzungen heute (nach diesem Aufruf) */
  remaining: number
}

// TTL großzügiger als ein Tag, damit die Keys sicher aufgeräumt werden
const TTL_SECONDS = 60 * 60 * 48

// "Tag" aus Sicht der Nutzer, nicht UTC: sv-SE formatiert als YYYY-MM-DD
function today(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })
}

function usageKey(feature: UsageFeature, userKey: string): string {
  return `usage:${feature}:${userKey}:${today()}`
}

// ── In-Memory-Fallback (lokal / Redis-Ausfall, gilt pro Instanz) ──
const memorySets = new Map<string, Set<string>>()
const memoryCounts = new Map<string, number>()

function consumeUniqueInMemory(key: string, member: string): UsageResult {
  const set = memorySets.get(key) ?? new Set<string>()
  memorySets.set(key, set)
  if (set.has(member)) return { allowed: true, remaining: Math.max(0, DAILY_LIMIT - set.size) }
  if (set.size >= DAILY_LIMIT) return { allowed: false, remaining: 0 }
  set.add(member)
  return { allowed: true, remaining: Math.max(0, DAILY_LIMIT - set.size) }
}

function consumeCountInMemory(key: string): UsageResult {
  const count = (memoryCounts.get(key) ?? 0) + 1
  if (count > DAILY_LIMIT) return { allowed: false, remaining: 0 }
  memoryCounts.set(key, count)
  return { allowed: true, remaining: Math.max(0, DAILY_LIMIT - count) }
}

/**
 * Set-basiertes Kontingent: dieselbe Einheit (z. B. dieselbe Stellen-Refnr)
 * zählt am selben Tag nur EINMAL. Erneutes Öffnen oder Regenerieren einer
 * bereits genutzten Anzeige verbraucht nichts.
 */
export async function consumeDailyUnique(
  feature: UsageFeature,
  userKey: string,
  member: string
): Promise<UsageResult> {
  const key = usageKey(feature, userKey)
  const redis = getRedis()
  if (redis) {
    try {
      const added = await redis.sadd(key, member)
      if (added === 1) await redis.expire(key, TTL_SECONDS)
      const count = await redis.scard(key)
      if (count > DAILY_LIMIT && added === 1) {
        // Limit würde überschritten, Eintrag zurückrollen
        await redis.srem(key, member)
        return { allowed: false, remaining: 0 }
      }
      return { allowed: true, remaining: Math.max(0, DAILY_LIMIT - Math.min(count, DAILY_LIMIT)) }
    } catch (error) {
      console.error('Usage-Kontingent (unique) via Upstash fehlgeschlagen:', error)
    }
  }
  return consumeUniqueInMemory(key, member)
}

/**
 * Verbrauch zurückgeben, wenn die eigentliche Aktion danach fehlschlägt
 * (z. B. Gemini-Fehler): ein gescheiterter Versuch soll nichts kosten.
 */
export async function refundDailyUnique(
  feature: UsageFeature,
  userKey: string,
  member: string
): Promise<void> {
  const key = usageKey(feature, userKey)
  const redis = getRedis()
  if (redis) {
    try {
      await redis.srem(key, member)
      return
    } catch (error) {
      console.error('Usage-Refund via Upstash fehlgeschlagen:', error)
    }
  }
  memorySets.get(key)?.delete(member)
}

/**
 * Verbleibendes Kontingent nur LESEN, ohne etwas zu verbrauchen, für die
 * Anzeige "X von 3 heute übrig" vor dem ersten Klick. Nur für Set-basierte
 * Kontingente (summary/match/letter), nicht für den CV-Zähler.
 */
export async function peekDailyRemaining(feature: UsageFeature, userKey: string): Promise<number> {
  const key = usageKey(feature, userKey)
  const redis = getRedis()
  if (redis) {
    try {
      const count = await redis.scard(key)
      return Math.max(0, DAILY_LIMIT - count)
    } catch (error) {
      console.error('Usage-Kontingent (peek) via Upstash fehlgeschlagen:', error)
    }
  }
  return Math.max(0, DAILY_LIMIT - (memorySets.get(key)?.size ?? 0))
}

/** Zähler-basiertes Kontingent für Features ohne Dedupe-Einheit (CV-Upload). */
export async function consumeDailyCount(
  feature: UsageFeature,
  userKey: string
): Promise<UsageResult> {
  const key = usageKey(feature, userKey)
  const redis = getRedis()
  if (redis) {
    try {
      const count = await redis.incr(key)
      if (count === 1) await redis.expire(key, TTL_SECONDS)
      if (count > DAILY_LIMIT) return { allowed: false, remaining: 0 }
      return { allowed: true, remaining: Math.max(0, DAILY_LIMIT - count) }
    } catch (error) {
      console.error('Usage-Kontingent (count) via Upstash fehlgeschlagen:', error)
    }
  }
  return consumeCountInMemory(key)
}
