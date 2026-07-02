'use client'

import { Input } from '@/components/shared/Input'
import { Textarea } from '@/components/shared/Textarea'

interface CoverLetterHeadFieldsProps {
  subject: string
  date: string
  recipient: string
  onSubjectChange: (value: string) => void
  onDateChange: (value: string) => void
  onRecipientChange: (value: string) => void
}

/**
 * Editierbarer Briefkopf über dem Anschreiben-Text: Die KI erkennt die
 * Empfängeranschrift nicht immer korrekt — hier kann alles kontrolliert
 * und angepasst werden, bevor das PDF erzeugt wird.
 */
export function CoverLetterHeadFields({
  subject,
  date,
  recipient,
  onSubjectChange,
  onDateChange,
  onRecipientChange,
}: CoverLetterHeadFieldsProps) {
  return (
    <div className="border-border bg-surface mt-4 grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input
          label="Betreff"
          value={subject}
          onChange={(event) => onSubjectChange(event.target.value)}
        />
      </div>
      <Textarea
        label="Empfängeranschrift"
        value={recipient}
        rows={3}
        placeholder={'Firma\nStraße Hausnummer\nPLZ Ort'}
        onChange={(event) => onRecipientChange(event.target.value)}
      />
      <Input
        label="Ort, Datum"
        value={date}
        onChange={(event) => onDateChange(event.target.value)}
      />
    </div>
  )
}
