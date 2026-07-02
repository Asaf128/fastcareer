'use client'

import { useState, useTransition, type ChangeEvent } from 'react'
import { FileCheck, UploadCloud } from 'lucide-react'
import { uploadAndParseCv } from '@/actions/profile.actions'
import type { CvParseResult } from '@/types/ai.types'

interface CvUploadProps {
  onParsed: (parsed: CvParseResult) => void
  cvUrl: string | null
}

export function CvUpload({ onParsed, cvUrl }: CvUploadProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setStatus('idle')
    const formData = new FormData()
    formData.append('cv', file)
    event.target.value = ''

    startTransition(async () => {
      const result = await uploadAndParseCv(formData)
      if (result.error !== null) {
        setStatus('error')
        setErrorMessage(result.error)
        return
      }
      onParsed(result.parsed)
      setStatus('success')
    })
  }

  return (
    <div className="border-border bg-surface rounded-xl border border-dashed p-6 text-center">
      {cvUrl && (
        <p className="text-text-secondary mb-3 flex items-center justify-center gap-1.5 text-xs">
          <FileCheck className="text-success h-4 w-4 shrink-0" />
          Lebenslauf hinterlegt —{' '}
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            ansehen (PDF)
          </a>
        </p>
      )}
      <UploadCloud className="text-text-secondary mx-auto h-6 w-6" />
      <label
        htmlFor="cv-upload"
        className="text-accent mt-2 block cursor-pointer text-sm font-medium hover:underline"
      >
        {cvUrl ? 'Neuen Lebenslauf (PDF) hochladen' : 'Lebenslauf (PDF) hochladen'}
      </label>
      <p className="text-text-secondary mt-1 text-xs">
        Wir lesen deinen Lebenslauf aus und füllen das Formular unten automatisch aus.
      </p>
      <input
        id="cv-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={isPending}
        className="sr-only"
      />
      {isPending && (
        <p className="text-text-secondary mt-3 text-xs" role="status">
          Lebenslauf wird ausgelesen …
        </p>
      )}
      {status === 'success' && (
        <p className="text-success mt-3 text-xs">
          Felder wurden automatisch ausgefüllt. Bitte prüfen und speichern.
        </p>
      )}
      {status === 'error' && <p className="text-error mt-3 text-xs">{errorMessage}</p>}
    </div>
  )
}
