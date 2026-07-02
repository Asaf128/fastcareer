'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Check, Copy, Download, FileText, Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { saveCoverLetter } from '@/actions/applications.actions'
import { generateAndSaveCoverLetter } from '@/actions/coverLetter.actions'
import { Button } from '@/components/shared/Button'

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
  const [isCopied, setIsCopied] = useState(false)
  const [isSaving, startSaving] = useTransition()
  const [isGenerating, startGenerating] = useTransition()

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
    startGenerating(async () => {
      const result = await generateAndSaveCoverLetter({ jobRefnr, titel, arbeitgeber, ort })
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      setText(result.coverLetter)
      toast.success('Anschreiben erstellt und gespeichert.')
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
    // jspdf erst beim Klick laden — hält es aus dem initialen Bundle raus
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)

    // DIN-5008-nahes Layout: einfacher Zeilenabstand, kein Absatzabstand
    const marginLeft = 25
    const marginRight = 20
    const pageWidth = 210
    const rightEdge = pageWidth - marginRight
    const lineHeight = 5
    const maxY = 277
    let y = 20

    // Eigene Anschrift — oben rechts
    const senderLines = [senderName, senderStreet, senderLocation].filter((line): line is string =>
      Boolean(line)
    )
    for (const line of senderLines) {
      doc.text(line, rightEdge, y, { align: 'right' })
      y += lineHeight
    }

    // 3 Leerzeilen, dann Empfänger links
    y += 3 * lineHeight
    const recipientLines = [arbeitgeber, ort].filter(Boolean)
    for (const line of recipientLines) {
      doc.text(line, marginLeft, y)
      y += lineHeight
    }

    // 2 Leerzeilen, dann Datum rechts (Ort aus der eigenen Anschrift, ohne PLZ)
    y += 2 * lineHeight
    const city = senderLocation?.replace(/^\d{4,5}\s*/, '').trim()
    const today = new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    doc.text(city ? `${city}, ${today}` : today, rightEdge, y, { align: 'right' })
    y += lineHeight

    // 2 Leerzeilen, dann Betreff fett links
    y += 2 * lineHeight
    doc.setFont('helvetica', 'bold')
    doc.text(`Bewerbung als ${titel}`, marginLeft, y)
    doc.setFont('helvetica', 'normal')
    y += lineHeight

    // 2 Leerzeilen, dann der Brieftext
    y += 2 * lineHeight
    const bodyWidth = pageWidth - marginLeft - marginRight
    const bodyLines = doc.splitTextToSize(text.replace(/\*\*/g, ''), bodyWidth) as string[]
    for (const line of bodyLines) {
      if (y > maxY) {
        doc.addPage()
        y = 20
      }
      doc.text(line, marginLeft, y)
      y += lineHeight
    }

    doc.save(`Anschreiben-${arbeitgeber.replace(/[^\wäöüÄÖÜß-]+/g, '_').slice(0, 50)}.pdf`)
  }

  const mailtoHref = kontaktEmail
    ? `mailto:${kontaktEmail}?subject=${encodeURIComponent(`Bewerbung als ${titel}`)}&body=${encodeURIComponent(text.slice(0, 1800))}`
    : null

  if (!text && !isGenerating) {
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

      {isGenerating ? (
        <div className="mt-4 space-y-2" role="status" aria-label="Anschreiben wird erstellt">
          <div className="bg-surface h-3 w-full animate-pulse rounded" />
          <div className="bg-surface h-3 w-full animate-pulse rounded" />
          <div className="bg-surface h-3 w-5/6 animate-pulse rounded" />
          <div className="bg-surface h-3 w-full animate-pulse rounded" />
          <div className="bg-surface h-3 w-2/3 animate-pulse rounded" />
          <p className="text-text-secondary pt-2 text-xs">
            Die KI schreibt dein Anschreiben — einen Moment …
          </p>
        </div>
      ) : (
        <>
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
