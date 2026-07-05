import { z } from 'zod'
import { Type } from '@google/genai'
import { getGenAiClient, MODEL_SUMMARY } from './genai'
import { recordAiCost } from './costTracking'
import type { JobSummary, MatchScoreResult } from '@/types/ai.types'
import type { Profile } from '@/types/profile.types'

const matchScoreSchema = z.object({
  score: z.number().min(0).max(100),
  begruendung: z.array(z.string()).max(4),
})

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    begruendung: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['score', 'begruendung'],
}

interface MatchScoreInput {
  titel: string
  summary: JobSummary
  profile: Profile
}

export async function calculateMatchScore(input: MatchScoreInput): Promise<MatchScoreResult> {
  const ai = getGenAiClient()

  const response = await ai.models.generateContent({
    model: MODEL_SUMMARY,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Bewerte, wie gut dieses Profil zu der Stelle passt (0 bis 100).

Stelle: ${input.titel}
Anforderungen: ${input.summary.anforderungen.join('; ') || 'keine Angaben'}
Aufgaben: ${input.summary.aufgaben.join('; ') || 'keine Angaben'}

Profil:
Kurzprofil: ${input.profile.headline ?? '-'}
Fähigkeiten: ${input.profile.skills.join(', ') || '-'}
Sprachen: ${input.profile.languages.join(', ') || '-'}
Berufserfahrung (JSON): ${JSON.stringify(input.profile.work_experience)}
Ausbildung (JSON): ${JSON.stringify(input.profile.education)}

Gib einen realistischen Score und 2 bis 4 kurze Begründungspunkte auf Deutsch (je max. 12 Wörter, konkret: was passt, was fehlt).`,
          },
        ],
      },
    ],
    config: {
      systemInstruction:
        'Du bist eine nüchterne Recruiting-KI. Bewerte ehrlich und differenziert: 100 nur bei perfekter Passung, unter 40 bei fehlenden Kernanforderungen. Antworte ausschließlich mit validem JSON gemäß Schema.',
      responseMimeType: 'application/json',
      responseSchema,
    },
  })

  await recordAiCost(MODEL_SUMMARY, response.usageMetadata)

  const text = response.text
  if (!text) throw new Error('Keine Antwort von Gemini erhalten.')

  const parsed = matchScoreSchema.parse(JSON.parse(text))
  return { score: Math.round(parsed.score), begruendung: parsed.begruendung }
}
