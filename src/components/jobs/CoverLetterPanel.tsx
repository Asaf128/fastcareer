'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Check, Copy, FileText } from 'lucide-react'
import { saveCoverLetter } from '@/actions/applications.actions'

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
  const [isPending, startTransition] = useTransition()

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

  function handleBlur() {
    startTransition(async () => {
      await saveCoverLetter({ jobRefnr, titel, arbeitgeber, ort, coverLetter: text })
    })
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
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

      <label htmlFor={`cover-letter-${jobRefnr}`} className="sr-only">
        Anschreiben bearbeiten
      </label>
      <textarea
        id={`cover-letter-${jobRefnr}`}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={handleBlur}
        rows={12}
        disabled={isPending}
        className="border-border bg-background text-text-primary mt-4 w-full rounded-lg border p-4 text-sm leading-relaxed disabled:opacity-70"
      />
    </div>
  )
}
