import { getGenAiClient, MODEL_LETTER } from './genai'
import { recordAiCost } from './costTracking'
import type { Profile } from '@/types/profile.types'
import type { JobSummary } from '@/types/ai.types'

interface GenerateCoverLetterInput {
  titel: string
  arbeitgeber: string
  ort: string
  summary: JobSummary
  profile: Profile
}

export async function generateCoverLetter(
  input: GenerateCoverLetterInput,
  userId: string | null
): Promise<string> {
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

Schreibe NUR den Brieftext eines individuellen, überzeugenden Anschreibens auf Deutsch: beginnend mit der Anrede (z. B. "Sehr geehrte Damen und Herren,") und endend mit "Mit freundlichen Grüßen" gefolgt vom Namen der Person. KEINE Betreffzeile, KEINE Adressen, KEIN Datum, das ergänzt das System selbst. KEINERLEI Markdown-Formatierung (keine **Sterne**, keine Überschriften), nur reiner Fließtext. Beziehe dich konkret auf die Anforderungen der Stelle und die tatsächliche Erfahrung der Person aus dem Profil, erfinde keine Erfahrungen oder Fähigkeiten. Formeller, aber persönlicher Ton. Keine Platzhalter wie "[Name einfügen]", keine Meta-Kommentare.`,
          },
        ],
      },
    ],
    config: {
      systemInstruction:
        'Du bist ein professioneller Karriereberater, der maßgeschneiderte Anschreiben auf Deutsch verfasst: sachlich, konkret, ohne Floskeln.',
    },
  })

  await recordAiCost(MODEL_LETTER, response.usageMetadata, userId)

  const text = response.text
  if (!text) throw new Error('Keine Antwort von Gemini erhalten.')
  // Sicherheitsnetz: Markdown-Fett und versehentliche Betreffzeilen entfernen
  return text
    .replace(/\*\*/g, '')
    .replace(/^\s*Betreff:.*$/im, '')
    .trim()
}
