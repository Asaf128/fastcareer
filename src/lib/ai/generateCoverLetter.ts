import { getGenAiClient, MODEL_LETTER } from './genai'
import type { Profile } from '@/types/profile.types'
import type { JobSummary } from '@/types/ai.types'

interface GenerateCoverLetterInput {
  titel: string
  arbeitgeber: string
  ort: string
  summary: JobSummary
  profile: Profile
}

export async function generateCoverLetter(input: GenerateCoverLetterInput): Promise<string> {
  const ai = getGenAiClient()

  const profilBlock = `Name: ${input.profile.full_name ?? 'unbekannt'}
Kurzprofil: ${input.profile.headline ?? '-'}
Über mich: ${input.profile.about ?? '-'}
Fähigkeiten: ${input.profile.skills.join(', ') || '-'}
Sprachen: ${input.profile.languages.join(', ') || '-'}
Berufserfahrung (JSON): ${JSON.stringify(input.profile.work_experience)}
Ausbildung (JSON): ${JSON.stringify(input.profile.education)}`

  const jobBlock = `Position: ${input.titel}
Arbeitgeber: ${input.arbeitgeber}
Ort: ${input.ort}
Aufgaben: ${input.summary.aufgaben.join('; ')}
Anforderungen: ${input.summary.anforderungen.join('; ')}`

  const response = await ai.models.generateContent({
    model: MODEL_LETTER,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Profil der bewerbenden Person:
${profilBlock}

Stellenangebot:
${jobBlock}

Schreibe ein individuelles, überzeugendes Anschreiben auf Deutsch für diese Bewerbung. Beziehe dich konkret auf die Anforderungen der Stelle und die tatsächliche Erfahrung der Person aus dem Profil — erfinde keine Erfahrungen oder Fähigkeiten. Formeller, aber persönlicher Ton. Reiner Fließtext ohne Anrede-Platzhalter wie "[Name einfügen]" — nutze die im Profil vorhandenen Daten. Keine Meta-Kommentare, nur der Anschreiben-Text.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction:
        'Du bist ein professioneller Karriereberater, der maßgeschneiderte Anschreiben auf Deutsch verfasst — sachlich, konkret, ohne Floskeln.',
    },
  })

  const text = response.text
  if (!text) throw new Error('Keine Antwort von Gemini erhalten.')
  return text.trim()
}
