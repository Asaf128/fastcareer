import { getRedis } from '@/lib/redis'

/**
 * Freemium-Kontingente: 2 Nutzungen pro Feature alle 7 Tage, getrennt
 * gezählt (Zusammenfassung, Match, Anschreiben, CV-Analyse). Suche und
 * Original-Anzeigen bleiben immer frei. Angemeldete Nutzer zählen per
 * User-ID, anonyme per IP (Schnupper-Kontingent).
 *
 * Feste 7-Tage-Fenster ab einem gemeinsamen Anker-Datum (nicht rollierend
 * pro Nutzer) — dadurch resetten alle Nutzer gleichzeitig und die
 * Reset-Zeit lässt sich ohne Redis-Zugriff berechnen.
 */
export const USAGE_LIMIT = 2
export const USAGE_PERIOD_DAYS = 7

export type UsageFeature = 'summary' | 'match' | 'letter' | 'cv'

export interface UsageResult {
  allowed: boolean
  /** Verbleibende Nutzungen in diesem Zeitraum (nach diesem Aufruf) */
  remaining: number
}

const DAY_MS = 24 * 60 * 60 * 1000
const PERIOD_MS = USAGE_PERIOD_DAYS * DAY_MS
// TTL großzügiger als eine Periode, damit die Keys sicher aufgeräumt werden
const TTL_SECONDS = (USAGE_PERIOD_DAYS + 2) * 24 * 60 * 60
// Anker für die 7-Tage-Fenster: 1. Januar 2024, 00:00 Uhr
const PERIOD_ANCHOR_MS = new Date('2024-01-01T00:00:00Z').getTime()

// "Tag" aus Sicht der Nutzer, nicht UTC: sv-SE formatiert als YYYY-MM-DD
function todayMidnightMs(): number {
  const dateStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })
  return new Date(`${dateStr}T00:00:00Z`).getTime()
}

function periodIndex(): number {
  return Math.floor((todayMidnightMs() - PERIOD_ANCHOR_MS) / PERIOD_MS)
}

/** Zeitpunkt, an dem sich das aktuelle 7-Tage-Fenster zurücksetzt. */
export function usagePeriodResetAt(): Date {
  return new Date(PERIOD_ANCHOR_MS + (periodIndex() + 1) * PERIOD_MS)
}

function usageKey(feature: UsageFeature, userKey: string): string {
  return `usage:${feature}:${userKey}:${periodIndex()}`
}

// ── In-Memory-Fallback (lokal / Redis-Ausfall, gilt pro Instanz) ──
const memorySets = new Map<string, Set<string>>()
const memoryCounts = new Map<string, number>()

function consumeUniqueInMemory(key: string, member: string): UsageResult {
  const set = memorySets.get(key) ?? new Set<string>()
  memorySets.set(key, set)
  if (set.has(member)) return { allowed: true, remaining: Math.max(0, USAGE_LIMIT - set.size) }
  if (set.size >= USAGE_LIMIT) return { allowed: false, remaining: 0 }
  set.add(member)
  return { allowed: true, remaining: Math.max(0, USAGE_LIMIT - set.size) }
}

function consumeCountInMemory(key: string): UsageResult {
  const count = (memoryCounts.get(key) ?? 0) + 1
  if (count > USAGE_LIMIT) return { allowed: false, remaining: 0 }
  memoryCounts.set(key, count)
  return { allowed: true, remaining: Math.max(0, USAGE_LIMIT - count) }
}

/**
 * Set-basiertes Kontingent: dieselbe Einheit (z. B. dieselbe Stellen-Refnr)
 * zählt in diesem Zeitraum nur EINMAL. Erneutes Öffnen oder Regenerieren
 * einer bereits genutzten Anzeige verbraucht nichts.
 */
export async function consumePeriodUnique(
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
      if (count > USAGE_LIMIT && added === 1) {
        // Limit würde überschritten, Eintrag zurückrollen
        await redis.srem(key, member)
        return { allowed: false, remaining: 0 }
      }
      return { allowed: true, remaining: Math.max(0, USAGE_LIMIT - Math.min(count, USAGE_LIMIT)) }
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
export async function refundPeriodUnique(
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
 * Anzeige "X von 2 übrig" vor dem ersten Klick. Nur für Set-basierte
 * Kontingente (summary/match/letter), nicht für den CV-Zähler.
 */
export async function peekPeriodRemaining(feature: UsageFeature, userKey: string): Promise<number> {
  const key = usageKey(feature, userKey)
  const redis = getRedis()
  if (redis) {
    try {
      const count = await redis.scard(key)
      return Math.max(0, USAGE_LIMIT - count)
    } catch (error) {
      console.error('Usage-Kontingent (peek) via Upstash fehlgeschlagen:', error)
    }
  }
  return Math.max(0, USAGE_LIMIT - (memorySets.get(key)?.size ?? 0))
}

/** Zähler-basiertes Kontingent für Features ohne Dedupe-Einheit (CV-Upload). */
export async function consumePeriodCount(
  feature: UsageFeature,
  userKey: string
): Promise<UsageResult> {
  const key = usageKey(feature, userKey)
  const redis = getRedis()
  if (redis) {
    try {
      const count = await redis.incr(key)
      if (count === 1) await redis.expire(key, TTL_SECONDS)
      if (count > USAGE_LIMIT) return { allowed: false, remaining: 0 }
      return { allowed: true, remaining: Math.max(0, USAGE_LIMIT - count) }
    } catch (error) {
      console.error('Usage-Kontingent (count) via Upstash fehlgeschlagen:', error)
    }
  }
  return consumeCountInMemory(key)
}
