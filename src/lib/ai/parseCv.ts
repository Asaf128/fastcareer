import { z } from 'zod'
import { Type } from '@google/genai'
import { getGenAiClient, MODEL_CV } from './genai'
import { normalizeIsoDate, normalizeMonthDate } from './normalizeCvDates'
import type { CvParseResult } from '@/types/ai.types'

const workExperienceSchema = z.object({
  position: z.string(),
  firma: z.string(),
  von: z.string(),
  bis: z.string().nullable(),
  beschreibung: z.string(),
})

const educationSchema = z.object({
  abschluss: z.string(),
  einrichtung: z.string(),
  von: z.string(),
  bis: z.string().nullable(),
})

const cvParseSchema = z.object({
  full_name: z.string().nullable(),
  birth_date: z.string().nullable(),
  street: z.string().nullable(),
  location: z.string().nullable(),
  headline: z.string().nullable(),
  about: z.string().nullable(),
  work_experience: z.array(workExperienceSchema),
  education: z.array(educationSchema),
  skills: z.array(z.string()),
  languages: z.array(z.string()),
})

const workExperienceItemSchema = {
  type: Type.OBJECT,
  properties: {
    position: { type: Type.STRING },
    firma: { type: Type.STRING },
    von: { type: Type.STRING },
    bis: { type: Type.STRING, nullable: true },
    beschreibung: { type: Type.STRING },
  },
  required: ['position', 'firma', 'von', 'bis', 'beschreibung'],
}

const educationItemSchema = {
  type: Type.OBJECT,
  properties: {
    abschluss: { type: Type.STRING },
    einrichtung: { type: Type.STRING },
    von: { type: Type.STRING },
    bis: { type: Type.STRING, nullable: true },
  },
  required: ['abschluss', 'einrichtung', 'von', 'bis'],
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    full_name: { type: Type.STRING, nullable: true },
    birth_date: { type: Type.STRING, nullable: true },
    street: { type: Type.STRING, nullable: true },
    location: { type: Type.STRING, nullable: true },
    headline: { type: Type.STRING, nullable: true },
    about: { type: Type.STRING, nullable: true },
    work_experience: { type: Type.ARRAY, items: workExperienceItemSchema },
    education: { type: Type.ARRAY, items: educationItemSchema },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    languages: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    'full_name',
    'birth_date',
    'street',
    'location',
    'headline',
    'about',
    'work_experience',
    'education',
    'skills',
    'languages',
  ],
}

export async function parseCv(pdfBase64: string): Promise<CvParseResult> {
  const ai = getGenAiClient()

  const response = await ai.models.generateContent({
    model: MODEL_CV,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
          {
            text: 'Lies diesen Lebenslauf aus und extrahiere die Profildaten strukturiert. street = Straße und Hausnummer (ohne PLZ/Ort), location = PLZ und Ort. birth_date im Format YYYY-MM-DD, falls erkennbar, sonst null. Alle "von"- und "bis"-Datumsfelder (Berufserfahrung, Ausbildung) ausschließlich im Format YYYY-MM (Jahr-Monat) angeben — falls nur ein Jahr bekannt ist, Januar als Monat annehmen (z. B. "2020" → "2020-01"). "bis" ist null, wenn die Station noch aktuell ist. Das Feld "beschreibung" jeder Berufserfahrungs-Station IMMER befüllen: fasse die im Lebenslauf genannten Tätigkeiten/Stichpunkte dieser Station in 1–3 vollständigen Sätzen zusammen; nur wenn der Lebenslauf wirklich gar nichts zu den Tätigkeiten sagt, leite eine knappe, typische Tätigkeitsbeschreibung aus der Positionsbezeichnung ab. Erfinde sonst keine Informationen — wenn ein Feld nicht im Lebenslauf steht, gib null bzw. ein leeres Array zurück.',
          },
        ],
      },
    ],
    config: {
      systemInstruction:
        'Du extrahierst Lebenslauf-Daten präzise und ohne Erfindungen. Antworte ausschließlich mit validem JSON gemäß Schema.',
      responseMimeType: 'application/json',
      responseSchema,
    },
  })

  const text = response.text
  if (!text) throw new Error('Keine Antwort von Gemini erhalten.')

  const parsed: unknown = JSON.parse(text)
  const result = cvParseSchema.parse(parsed)

  return {
    ...result,
    birth_date: normalizeIsoDate(result.birth_date),
    work_experience: result.work_experience.map((entry) => ({
      ...entry,
      von: normalizeMonthDate(entry.von) ?? entry.von,
      bis: normalizeMonthDate(entry.bis),
    })),
    education: result.education.map((entry) => ({
      ...entry,
      von: normalizeMonthDate(entry.von) ?? entry.von,
      bis: normalizeMonthDate(entry.bis),
    })),
  }
}
