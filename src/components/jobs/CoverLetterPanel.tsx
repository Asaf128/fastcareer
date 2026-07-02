'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Check, Copy, Download, FileText, Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { saveCoverLetter } from '@/actions/applications.actions'
import { generateAndSaveCoverLetter } from '@/actions/coverLetter.actions'
import { Button } from '@/components/shared/Button'
import { CoverLetterHeadFields } from '@/components/jobs/CoverLetterHeadFields'
import { AiThinkingMascot } from '@/components/jobs/AiThinkingMascot'
import { buildLetterDate, downloadCoverLetterPdf } from '@/components/jobs/coverLetterPdf'

// Wie lange die Sprechblase nach Abschluss noch "Fertig!" zeigt, bevor sie
// dem echten Anschreiben-Feld weicht
const MASCOT_DONE_DISPLAY_MS = 1100

interface CoverLetterPanelProps {
  jobRefnr: string
  titel: string
  arbeitgeber: string
  ort: string
  kontaktEmail: string | null
  isAuthenticated: boolean
  hasProfile: boolean
  initialCoverLetter: string | null
  senderName: string | null
  senderStreet: string | null
  senderLocation: string | null
}

function Teaser({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-surface mt-6 rounded-xl border border-dashed p-6 text-center">
      <FileText className="text-text-secondary mx-auto h-6 w-6" />
      <p className="text-text-secondary mt-2 text-sm">{children}</p>
    </div>
  )
}

export function CoverLetterPanel({
  jobRefnr,
  titel,
  arbeitgeber,
  ort,
  kontaktEmail,
  isAuthenticated,
  hasProfile,
  initialCoverLetter,
  senderName,
  senderStreet,
  senderLocation,
}: CoverLetterPanelProps) {
  const [text, setText] = useState(initialCoverLetter ?? '')
  const [subject, setSubject] = useState(`Bewerbung als ${titel}`)
  const [date, setDate] = useState(() => buildLetterDate(senderLocation))
  const [recipient, setRecipient] = useState([arbeitgeber, ort].filter(Boolean).join('\n'))
  const [isCopied, setIsCopied] = useState(false)
  const [isSaving, startSaving] = useTransition()
  const [isGenerating, startGenerating] = useTransition()
  // Getrennt von isGenerating: bleibt nach Abschluss noch kurz aktiv, damit
  // die Sprechblase "Fertig!" zeigen kann, statt sofort zu verschwinden
  const [showMascot, setShowMascot] = useState(false)

  if (!isAuthenticated) {
    return (
      <Teaser>
        <Link href="/login" className="text-accent hover:underline">
          Melde dich an
        </Link>{' '}
        um ein maßgeschneidertes Anschreiben zu erhalten.
      </Teaser>
    )
  }

  if (!hasProfile) {
    return (
      <Teaser>
        <Link href="/profil" className="text-accent hover:underline">
          Fülle dein Profil aus
        </Link>{' '}
        damit wir ein Anschreiben für dich erstellen können.
      </Teaser>
    )
  }

  function handleGenerate() {
    setShowMascot(true)
    startGenerating(async () => {
      const result = await generateAndSaveCoverLetter({ jobRefnr, titel, arbeitgeber, ort })
      if (result.error !== null) {
        toast.error(result.error)
        setShowMascot(false)
        return
      }
      setText(result.coverLetter)
      toast.success('Anschreiben erstellt und gespeichert.')
      setTimeout(() => setShowMascot(false), MASCOT_DONE_DISPLAY_MS)
    })
  }

  function handleBlur() {
    startSaving(async () => {
      await saveCoverLetter({ jobRefnr, titel, arbeitgeber, ort, coverLetter: text })
    })
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  async function downloadPdf() {
    await downloadCoverLetterPdf({
      senderName,
      senderStreet,
      senderLocation,
      recipient,
      date,
      subject,
      bodyText: text,
      arbeitgeber,
    })
  }

  const mailtoHref = kontaktEmail
    ? `mailto:${kontaktEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text.slice(0, 1800))}`
    : null

  if (!text && !showMascot) {
    return (
      <div className="border-border bg-background mt-6 rounded-xl border p-6 shadow-sm lg:p-8">
        <h2 className="text-foreground text-lg font-semibold">Dein Anschreiben</h2>
        <p className="text-text-secondary mt-2 text-sm">
          Die KI erstellt aus deinem Profil und den Anforderungen der Stelle ein maßgeschneidertes
          Anschreiben — dauert ca. 20–30 Sekunden.
        </p>
        <Button variant="accent" className="mt-4" onClick={handleGenerate}>
          <Sparkles className="h-4 w-4" />
          Anschreiben mit KI erstellen
        </Button>
      </div>
    )
  }

  return (
    <div className="border-border bg-background mt-6 rounded-xl border p-6 shadow-sm lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-foreground text-lg font-semibold">Dein Anschreiben</h2>
        <button
          type="button"
          onClick={copyToClipboard}
          aria-label="Anschreiben kopieren"
          className="border-border text-text-secondary hover:border-accent hover:text-accent flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-150"
        >
          {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {isCopied ? 'Kopiert' : 'Kopieren'}
        </button>
      </div>

      {showMascot ? (
        <div className="mt-8">
          <AiThinkingMascot
            phase={isGenerating ? 'thinking' : 'done'}
            titel={titel}
            arbeitgeber={arbeitgeber}
          />
          <div className="border-border bg-surface space-y-2 rounded-lg border p-4">
            <div className="bg-surface-2 h-3 w-full animate-pulse rounded" />
            <div className="bg-surface-2 h-3 w-full animate-pulse rounded" />
            <div className="bg-surface-2 h-3 w-5/6 animate-pulse rounded" />
            <div className="bg-surface-2 h-3 w-full animate-pulse rounded" />
            <div className="bg-surface-2 h-3 w-2/3 animate-pulse rounded" />
          </div>
        </div>
      ) : (
        <>
          <CoverLetterHeadFields
            subject={subject}
            date={date}
            recipient={recipient}
            onSubjectChange={setSubject}
            onDateChange={setDate}
            onRecipientChange={setRecipient}
          />

          <label htmlFor={`cover-letter-${jobRefnr}`} className="sr-only">
            Anschreiben bearbeiten
          </label>
          <textarea
            id={`cover-letter-${jobRefnr}`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onBlur={handleBlur}
            rows={12}
            disabled={isSaving}
            className="border-border bg-background text-text-primary mt-4 w-full rounded-lg border p-4 text-sm leading-relaxed disabled:opacity-70"
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" size="sm" onClick={downloadPdf}>
              <Download className="h-4 w-4" />
              Als PDF herunterladen
            </Button>
            {mailtoHref && (
              <a
                href={mailtoHref}
                className="bg-accent hover:bg-accent-dark inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
              >
                <Send className="h-4 w-4" />
                Per E-Mail bewerben
              </a>
            )}
          </div>
        </>
      )}
    </div>
  )
}
