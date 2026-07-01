'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Check, Copy, FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { saveCoverLetter } from '@/actions/applications.actions'
import { generateAndSaveCoverLetter } from '@/actions/coverLetter.actions'
import { Button } from '@/components/shared/Button'

interface CoverLetterPanelProps {
  jobRefnr: string
  titel: string
  arbeitgeber: string
  ort: string
  isAuthenticated: boolean
  hasProfile: boolean
  initialCoverLetter: string | null
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
  isAuthenticated,
  hasProfile,
  initialCoverLetter,
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
        </>
      )}
    </div>
  )
}
