import { ExternalLink } from 'lucide-react'

interface OriginalListingProps {
  kontaktEmail: string | null
  quelleUrl: string
}

export function OriginalListing({ kontaktEmail, quelleUrl }: OriginalListingProps) {
  return (
    <div className="border-border mt-6 border-t pt-6">
      <h2 className="text-base font-semibold">Kontakt &amp; Bewerbung</h2>
      {kontaktEmail ? (
        <p className="mt-2 text-sm">
          <a href={`mailto:${kontaktEmail}`} className="text-accent hover:underline">
            {kontaktEmail}
          </a>
        </p>
      ) : (
        <p className="text-text-secondary mt-2 text-sm">
          Der Arbeitgeber hat die Kontaktdaten auf der Arbeitsagentur-Seite gesichert. Bitte öffne
          das Original-Stellenangebot, um dich zu bewerben.
        </p>
      )}
      <a
        href={quelleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-accent hover:bg-accent-dark mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
      >
        Original-Stellenangebot öffnen
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}
