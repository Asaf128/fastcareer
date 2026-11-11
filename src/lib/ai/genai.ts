import { GoogleGenAI } from '@google/genai'

// Google hat für gemini-2.5-flash/-pro auf Vertex AI den 20.10.2026 als
// frühestes Abschaltdatum genannt. Stand 11.11.2026 antwortet 2.5-flash in
// europe-west4 noch, die genannten Nachfolger (gemini-3.5-flash-lite,
// gemini-3.8-flash) sind dort für dieses Projekt aber nicht verfügbar (404).
// Deshalb bleiben die 2.5er Default und sind per Env überschreibbar, damit
// der Wechsel ohne Code-Änderung möglich ist, sobald er nötig wird.
export const MODEL_SUMMARY = process.env.GEMINI_MODEL_FAST || 'gemini-2.5-flash'
export const MODEL_LETTER = process.env.GEMINI_MODEL_PRO || 'gemini-2.5-pro'
export const MODEL_CV = process.env.GEMINI_MODEL_PRO || 'gemini-2.5-pro'

let cachedClient: GoogleGenAI | null = null

export function getGenAiClient(): GoogleGenAI {
  if (cachedClient) return cachedClient

  const project = process.env.GOOGLE_CLOUD_PROJECT
  const location = process.env.GOOGLE_CLOUD_LOCATION
  const keyB64 = process.env.GCP_SERVICE_ACCOUNT_KEY_B64

  if (!project || !location || !keyB64) {
    throw new Error(
      'Gemini/Vertex-Konfiguration fehlt: GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION oder GCP_SERVICE_ACCOUNT_KEY_B64 nicht gesetzt.'
    )
  }

  const credentials = JSON.parse(Buffer.from(keyB64, 'base64').toString('utf8')) as Record<
    string,
    unknown
  >

  cachedClient = new GoogleGenAI({
    vertexai: true,
    project,
    location,
    googleAuthOptions: { credentials },
  })

  return cachedClient
}

export function isAiConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLOUD_PROJECT &&
    process.env.GOOGLE_CLOUD_LOCATION &&
    process.env.GCP_SERVICE_ACCOUNT_KEY_B64
  )
}
