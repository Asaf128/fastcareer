import { z } from 'zod'
import { Type } from '@google/genai'
import { getGenAiClient, MODEL_SUMMARY } from './genai'
import { recordAiCost } from './costTracking'
import type { JobSummary } from '@/types/ai.types'

const jobSummarySchema = z.object({
  kurzbeschreibung: z.string(),
  aufgaben: z.array(z.string()),
  anforderungen: z.array(z.string()),
  benefits: z.array(z.string()),
  arbeitszeit: z.string().nullable(),
  standort: z.string().nullable(),
  unternehmen: z.string(),
})

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    kurzbeschreibung: { type: Type.STRING },
    aufgaben: { type: Type.ARRAY, items: { type: Type.STRING } },
    anforderungen: { type: Type.ARRAY, items: { type: Type.STRING } },
    benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
    arbeitszeit: { type: Type.STRING, nullable: true },
    standort: { type: Type.STRING, nullable: true },
    unternehmen: { type: Type.STRING },
  },
  required: [
    'kurzbeschreibung',
    'aufgaben',
    'anforderungen',
    'benefits',
    'arbeitszeit',
    'standort',
    'unternehmen',
  ],
}

interface SummarizeJobInput {
  titel: string
  arbeitgeber: string
  ort: string
  beschreibung: string
}

export async function summarizeJob(input: SummarizeJobInput): Promise<JobSummary> {
  const ai = getGenAiClient()

  const response = await ai.models.generateContent({
    model: MODEL_SUMMARY,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Fasse folgendes Stellenangebot für eine Jobsuchende Person übersichtlich zusammen. Schreibe auf Deutsch, klar und knapp, keine Marketing-Floskeln.

Titel: ${input.titel}
Arbeitgeber: ${input.arbeitgeber}
Ort: ${input.ort}

Stellenbeschreibung:
${input.beschreibung}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction:
        'Du extrahierst strukturierte Informationen aus Stellenanzeigen. Antworte ausschließlich mit validem JSON gemäß Schema, auf Deutsch, ohne Erfindungen. Wenn eine Information fehlt, gib einen leeren String, ein leeres Array oder null zurück.',
      responseMimeType: 'application/json',
      responseSchema,
    },
  })

  await recordAiCost(MODEL_SUMMARY, response.usageMetadata)

  const text = response.text
  if (!text) throw new Error('Keine Antwort von Gemini erhalten.')

  const parsed: unknown = JSON.parse(text)
  return jobSummarySchema.parse(parsed)
}
