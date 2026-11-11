import { GoogleGenAI } from '@google/genai'

// gemini-2.5-pro ist auf Vertex AI abgeschaltet (404 seit 11.11.2026),
// 2.5-flash steht ebenfalls auf der Abschaltliste. Nachfolger ist
// gemini-3.8-flash. Für dieses GCP-Projekt ist das Modell nur über
// GOOGLE_CLOUD_LOCATION=global erreichbar, in europe-west4 liefert es 404.
// Per Env überschreibbar, damit der nächste Modellwechsel ohne
// Code-Änderung möglich ist.
export const MODEL_SUMMARY = process.env.GEMINI_MODEL_FAST || 'gemini-3.8-flash'
export const MODEL_LETTER = process.env.GEMINI_MODEL_PRO || 'gemini-3.8-flash'
export const MODEL_CV = process.env.GEMINI_MODEL_PRO || 'gemini-3.8-flash'

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
