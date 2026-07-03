import { Check, Download, FileText, MapPin, Search, Send, Sparkles, Star } from 'lucide-react'

/**
 * Kompakte Nachbauten der echten UI als Illustrationen für die
 * Scroll-Experience, rein dekorativ, daher aria-hidden im ScrollShowcase.
 */

function MockCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-background mx-auto w-full max-w-md rounded-2xl border p-5 shadow-2xl">
      {children}
    </div>
  )
}

function TextBar({ width }: { width: string }) {
  return <div className={`bg-surface-2 h-2.5 rounded-full ${width}`} />
}

export function SearchVisual() {
  return (
    <MockCard>
      <div className="flex gap-2">
        <div className="border-border bg-surface flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
          <Search className="text-text-secondary h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground truncate text-xs">Pflegefachkraft</span>
        </div>
        <div className="border-border bg-surface flex items-center gap-2 rounded-lg border px-3 py-2">
          <MapPin className="text-text-secondary h-3.5 w-3.5" />
          <span className="text-foreground text-xs">Berlin</span>
        </div>
      </div>
      <div className="bg-accent mt-2 rounded-lg py-2 text-center text-xs font-medium text-white">
        Jobs suchen
      </div>
      <div className="mt-4 space-y-2">
        {[
          'Pflegefachkraft (m/w/d) bei Vivantes',
          'Gesundheits- und Krankenpfleger bei Charité',
        ].map((titel) => (
          <div key={titel} className="border-border flex items-center gap-3 rounded-lg border p-3">
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-xs font-semibold">{titel}</p>
              <p className="text-text-secondary mt-1 text-[10px]">Berlin · Vollzeit</p>
            </div>
            <Star className="text-warning h-4 w-4 shrink-0" />
          </div>
        ))}
      </div>
    </MockCard>
  )
}

export function SummaryVisual() {
  return (
    <MockCard>
      <div className="flex items-center gap-2">
        <Sparkles className="text-accent h-4 w-4" />
        <span className="text-foreground text-sm font-semibold">KI-Zusammenfassung</span>
      </div>
      <div className="mt-4 space-y-3">
        {['Deine Aufgaben', 'Das bringst du mit', 'Das bekommst du'].map((heading) => (
          <div key={heading}>
            <p className="text-text-secondary text-[10px] font-medium tracking-wide uppercase">
              {heading}
            </p>
            <div className="mt-1.5 space-y-1.5">
              <TextBar width="w-full" />
              <TextBar width="w-4/5" />
            </div>
          </div>
        ))}
      </div>
      <div className="border-border mt-4 flex items-center justify-between rounded-lg border p-3">
        <span className="text-foreground text-xs font-medium">Match mit deinem Profil</span>
        <span className="bg-success/10 text-success rounded-full px-2.5 py-0.5 text-xs font-semibold">
          87 %
        </span>
      </div>
    </MockCard>
  )
}

export function LetterVisual() {
  return (
    <MockCard>
      <div className="flex items-center justify-between">
        <span className="text-foreground text-sm font-semibold">Dein Anschreiben</span>
        <span className="bg-accent flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-medium text-white">
          <Sparkles className="h-3 w-3" />
          Mit KI erstellen
        </span>
      </div>
      <div className="border-border bg-surface mt-3 space-y-2 rounded-lg border p-4">
        <p className="text-foreground text-xs">Sehr geehrte Damen und Herren,</p>
        <TextBar width="w-full" />
        <TextBar width="w-full" />
        <TextBar width="w-5/6" />
        <TextBar width="w-full" />
        <TextBar width="w-2/3" />
        <p className="text-foreground pt-1 text-xs">Mit freundlichen Grüßen</p>
      </div>
      <p className="text-text-secondary mt-3 flex items-center gap-1.5 text-[10px]">
        <Check className="text-success h-3 w-3" />
        Aus deinem Profil und den Anforderungen der Stelle erstellt
      </p>
    </MockCard>
  )
}

export function PdfVisual() {
  return (
    <MockCard>
      <div className="border-border bg-background mx-auto max-w-[240px] rounded-md border p-4 shadow-sm">
        <div className="flex flex-col items-end gap-1">
          <TextBar width="w-20" />
          <TextBar width="w-24" />
        </div>
        <div className="mt-4 space-y-1">
          <TextBar width="w-24" />
          <TextBar width="w-20" />
        </div>
        <div className="bg-foreground/70 mt-4 h-2.5 w-32 rounded-full" />
        <div className="mt-3 space-y-1.5">
          <TextBar width="w-full" />
          <TextBar width="w-full" />
          <TextBar width="w-4/5" />
          <TextBar width="w-full" />
          <TextBar width="w-1/2" />
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <span className="border-border text-text-secondary flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-medium">
          <Download className="h-3 w-3" />
          Als PDF
        </span>
        <span className="bg-accent flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-medium text-white">
          <Send className="h-3 w-3" />
          Per E-Mail bewerben
        </span>
      </div>
    </MockCard>
  )
}

export function BoardVisual() {
  const entries = [
    {
      titel: 'Pflegefachkraft bei Vivantes',
      status: 'Interview',
      badge: 'bg-warning/10 text-warning',
    },
    {
      titel: 'Stationsleitung bei DRK Kliniken',
      status: 'Beworben',
      badge: 'bg-accent/10 text-accent',
    },
    { titel: 'Krankenpfleger bei Charité', status: 'Zusage', badge: 'bg-success/10 text-success' },
  ]
  return (
    <MockCard>
      <div className="flex items-center gap-2">
        <FileText className="text-accent h-4 w-4" />
        <span className="text-foreground text-sm font-semibold">Meine Bewerbungen</span>
      </div>
      <div className="mt-4 space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.titel}
            className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <p className="text-foreground truncate text-xs font-semibold">{entry.titel}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${entry.badge}`}
            >
              {entry.status}
            </span>
          </div>
        ))}
      </div>
    </MockCard>
  )
}
