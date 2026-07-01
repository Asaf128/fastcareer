import { GoogleGenAI } from '@google/genai'

export const MODEL_SUMMARY = 'gemini-2.5-flash'
export const MODEL_LETTER = 'gemini-2.5-pro'
export const MODEL_CV = 'gemini-2.5-pro'

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
