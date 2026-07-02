interface CoverLetterPdfInput {
  senderName: string | null
  senderStreet: string | null
  senderLocation: string | null
  recipient: string
  date: string
  subject: string
  bodyText: string
  arbeitgeber: string
}

/** Standard-Datumszeile für den Briefkopf: "Ort, TT.MM.JJJJ" (Ort ohne PLZ). */
export function buildLetterDate(senderLocation: string | null): string {
  const city = senderLocation?.replace(/^\d{4,5}\s*/, '').trim()
  const today = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  return city ? `${city}, ${today}` : today
}

/**
 * DIN-5008-nahes Anschreiben als PDF. Der Name unter der Grußformel bekommt
 * drei Leerzeilen Abstand (Platz für die Unterschrift).
 */
export async function downloadCoverLetterPdf(input: CoverLetterPdfInput): Promise<void> {
  // jspdf erst beim Klick laden — hält es aus dem initialen Bundle raus
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)

  const marginLeft = 25
  const marginRight = 20
  const pageWidth = 210
  const rightEdge = pageWidth - marginRight
  const lineHeight = 5
  const maxY = 277
  let y = 20

  // Eigene Anschrift — oben rechts
  const senderLines = [input.senderName, input.senderStreet, input.senderLocation].filter(
    (line): line is string => Boolean(line)
  )
  for (const line of senderLines) {
    doc.text(line, rightEdge, y, { align: 'right' })
    y += lineHeight
  }

  // 3 Leerzeilen, dann Empfänger links
  y += 3 * lineHeight
  const recipientLines = input.recipient
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  for (const line of recipientLines) {
    doc.text(line, marginLeft, y)
    y += lineHeight
  }

  // 2 Leerzeilen, dann Datum rechts
  y += 2 * lineHeight
  doc.text(input.date, rightEdge, y, { align: 'right' })
  y += lineHeight

  // 2 Leerzeilen, dann Betreff fett links
  y += 2 * lineHeight
  doc.setFont('helvetica', 'bold')
  doc.text(input.subject, marginLeft, y)
  doc.setFont('helvetica', 'normal')
  y += lineHeight

  // 2 Leerzeilen, dann der Brieftext — Grußformel bekommt 3 Leerzeilen
  // Abstand zum Namen (Platz für die Unterschrift)
  y += 2 * lineHeight
  const bodyText = input.bodyText
    .replace(/\*\*/g, '')
    .replace(/(Mit freundlichen Grüßen,?)\s*\n+/, '$1\n\n\n\n')
  const bodyWidth = pageWidth - marginLeft - marginRight
  for (const paragraph of bodyText.split('\n')) {
    const lines =
      paragraph.trim() === '' ? [''] : (doc.splitTextToSize(paragraph, bodyWidth) as string[])
    for (const line of lines) {
      if (y > maxY) {
        doc.addPage()
        y = 20
      }
      if (line !== '') doc.text(line, marginLeft, y)
      y += lineHeight
    }
  }

  doc.save(`Anschreiben-${input.arbeitgeber.replace(/[^\wäöüÄÖÜß-]+/g, '_').slice(0, 50)}.pdf`)
}
