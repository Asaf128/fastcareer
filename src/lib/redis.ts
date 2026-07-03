import { Redis } from '@upstash/redis'

// Gemeinsamer Upstash-Client für Rate-Limiting und Tages-Kontingente.
// Ohne Env-Vars (z. B. lokal) gibt es null — die Aufrufer haben dann
// jeweils einen In-Memory-Fallback pro Serverless-Instanz.
let redisClient: Redis | null = null

export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  redisClient ??= new Redis({ url, token })
  return redisClient
}
