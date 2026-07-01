import { Briefcase, Building2, CheckCircle2, Clock, Gift } from 'lucide-react'
import type { JobSummary as JobSummaryData } from '@/types/ai.types'

interface JobSummaryProps {
  summary: JobSummaryData
}

function SummaryList({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: typeof Briefcase
  items: string[]
}) {
  if (items.length === 0) return null

  return (
    <div>
      <h3 className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      <ul className="text-text-primary mt-2 space-y-1.5 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="text-accent">
              •
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function JobSummary({ summary }: JobSummaryProps) {
  return (
    <div className="border-border bg-background mt-6 rounded-xl border p-6 shadow-sm lg:p-8">
      <h2 className="text-foreground text-lg font-semibold">Das erwartet dich</h2>
      <p className="text-text-primary mt-2 text-sm">{summary.kurzbeschreibung}</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <SummaryList title="Aufgaben" icon={Briefcase} items={summary.aufgaben} />
        <SummaryList title="Anforderungen" icon={CheckCircle2} items={summary.anforderungen} />
        <SummaryList title="Benefits" icon={Gift} items={summary.benefits} />
      </div>

      <div className="text-text-secondary mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs">
        {summary.arbeitszeit && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {summary.arbeitszeit}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          {summary.unternehmen}
        </span>
      </div>
    </div>
  )
}
