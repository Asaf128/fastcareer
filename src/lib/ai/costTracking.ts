import { getRedis } from '@/lib/redis'

/**
 * KI-Kosten-Tracking fürs Admin-Dashboard: Nach jedem Gemini-Call werden
 * die Token-Kosten als Mikro-USD-Integer (1 USD = 1.000.000) atomar in
 * Redis aufsummiert — ein Tageszähler (resetet um Mitternacht, Berlin)
 * und ein Gesamtzähler. Integer statt Float, damit INCRBY atomar bleibt
 * und keine Rundungsfehler kumulieren.
 */

// Vertex-AI-Listenpreise in USD pro 1 Mio. Tokens (= Mikro-USD pro Token),
// Output inkl. Thinking-Tokens. Bei Preisänderungen nur hier anpassen.
const MODEL_PRICING_USD_PER_M: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash': { input: 0.3, output: 2.5 },
  'gemini-2.5-pro': { input: 1.25, output: 10 },
}

const TOTAL_KEY = 'aicost:total'
// Tageszähler etwas länger aufheben als nötig, damit er sicher aufgeräumt wird
const DAY_TTL_SECONDS = 3 * 24 * 60 * 60

// Token-Felder strukturell typisiert, damit response.usageMetadata aller
// @google/genai-Versionen passt, ohne an deren Export-Namen zu hängen
interface UsageMetadataLike {
  promptTokenCount?: number
  candidatesTokenCount?: number
  thoughtsTokenCount?: number
}

function berlinDay(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' })
}

function dayKey(): string {
  return `aicost:day:${berlinDay()}`
}

function userTotalKey(userId: string): string {
  return `aicost:user:${userId}:total`
}

function userDayKey(userId: string): string {
  return `aicost:user:${userId}:day:${berlinDay()}`
}

// ── In-Memory-Fallback (lokal / Redis-Ausfall, gilt pro Instanz) ──
const memoryCosts = new Map<string, number>()

async function incrementCost(key: string, microUsd: number, ttlSeconds?: number): Promise<void> {
  const redis = getRedis()
  if (redis) {
    try {
      const value = await redis.incrby(key, microUsd)
      if (ttlSeconds && value === microUsd) await redis.expire(key, ttlSeconds)
      return
    } catch (error) {
      console.error('KI-Kosten-Tracking via Upstash fehlgeschlagen:', error)
    }
  }
  memoryCosts.set(key, (memoryCosts.get(key) ?? 0) + microUsd)
}

/**
 * Nach jedem Gemini-Call aufrufen. Zählt global (heute + gesamt) und, wenn
 * eine User-ID bekannt ist, zusätzlich pro Nutzer (anonyme Aufrufe landen
 * nur im globalen Zähler). Bewusst fehlertolerant: Ein fehlgeschlagener
 * Zähler darf das KI-Feature nie blockieren.
 */
export async function recordAiCost(
  model: string,
  usageMetadata: UsageMetadataLike | undefined,
  userId: string | null = null
): Promise<void> {
  const pricing = MODEL_PRICING_USD_PER_M[model]
  if (!pricing || !usageMetadata) return
  const promptTokens = usageMetadata.promptTokenCount ?? 0
  const outputTokens =
    (usageMetadata.candidatesTokenCount ?? 0) + (usageMetadata.thoughtsTokenCount ?? 0)
  const microUsd = Math.round(promptTokens * pricing.input + outputTokens * pricing.output)
  if (microUsd <= 0) return
  await Promise.all([
    incrementCost(TOTAL_KEY, microUsd),
    incrementCost(dayKey(), microUsd, DAY_TTL_SECONDS),
    ...(userId
      ? [
          incrementCost(userTotalKey(userId), microUsd),
          incrementCost(userDayKey(userId), microUsd, DAY_TTL_SECONDS),
        ]
      : []),
  ])
}

export interface AiCosts {
  todayUsd: number
  totalUsd: number
}

/** Kosten fürs Admin-Dashboard lesen (heute + gesamt, in USD). */
export async function readAiCosts(): Promise<AiCosts> {
  const key = dayKey()
  const redis = getRedis()
  if (redis) {
    try {
      const [today, total] = await Promise.all([
        redis.get<number>(key),
        redis.get<number>(TOTAL_KEY),
      ])
      return { todayUsd: (today ?? 0) / 1_000_000, totalUsd: (total ?? 0) / 1_000_000 }
    } catch (error) {
      console.error('KI-Kosten konnten nicht gelesen werden:', error)
    }
  }
  return {
    todayUsd: (memoryCosts.get(key) ?? 0) / 1_000_000,
    totalUsd: (memoryCosts.get(TOTAL_KEY) ?? 0) / 1_000_000,
  }
}

// Upstash-MGET in Häppchen, damit auch viele Nutzer in eine Anfrage passen
const MGET_CHUNK_SIZE = 400

/**
 * Kosten pro Nutzer fürs Admin-Dashboard lesen (heute + gesamt, in USD).
 * Nutzer ohne Einträge fehlen in der Map — Aufrufer fällt auf 0 zurück.
 */
export async function readUserAiCosts(userIds: string[]): Promise<Map<string, AiCosts>> {
  const costs = new Map<string, AiCosts>()
  if (userIds.length === 0) return costs

  const redis = getRedis()
  if (redis) {
    try {
      // Pro Nutzer zwei Keys: [total, day] — Reihenfolge bleibt erhalten
      const keys = userIds.flatMap((id) => [userTotalKey(id), userDayKey(id)])
      const values: (number | null)[] = []
      for (let i = 0; i < keys.length; i += MGET_CHUNK_SIZE) {
        const chunk = await redis.mget<(number | null)[]>(...keys.slice(i, i + MGET_CHUNK_SIZE))
        values.push(...chunk)
      }
      userIds.forEach((id, index) => {
        const total = values[index * 2] ?? 0
        const today = values[index * 2 + 1] ?? 0
        if (total > 0) costs.set(id, { todayUsd: today / 1_000_000, totalUsd: total / 1_000_000 })
      })
      return costs
    } catch (error) {
      console.error('Nutzer-KI-Kosten konnten nicht gelesen werden:', error)
    }
  }

  for (const id of userIds) {
    const total = memoryCosts.get(userTotalKey(id)) ?? 0
    if (total > 0) {
      costs.set(id, {
        todayUsd: (memoryCosts.get(userDayKey(id)) ?? 0) / 1_000_000,
        totalUsd: total / 1_000_000,
      })
    }
  }
  return costs
}
