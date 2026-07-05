import { createHash } from 'node:crypto'

/**
 * Pseudonymisiert eine IP-Adresse für Redis-Schlüssel (Gratis-Kontingente,
 * Rate-Limiting): Die Klar-IP verlässt so nie unseren Server Richtung
 * Upstash (Datenminimierung, Art. 25 DSGVO). 32 Hex-Zeichen reichen für
 * Kollisionsfreiheit bei kurzlebigen Zählern.
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}
