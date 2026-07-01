import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { SaveJobButton } from '@/components/jobs/SaveJobButton'
import type { JobListing } from '@/types/job.types'

interface JobCardProps {
  job: JobListing
  isSaved?: boolean
  isAuthenticated?: boolean
}

export function JobCard({ job, isSaved = false, isAuthenticated = false }: JobCardProps) {
  const detailParams = new URLSearchParams({
    titel: job.titel,
    arbeitgeber: job.arbeitgeber,
    ort: `${job.plz} ${job.ort}`.trim(),
  })

  return (
    <div className="border-border bg-background hover:border-accent/40 relative flex items-start gap-4 rounded-xl border p-5 shadow-sm transition-[box-shadow,transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/suche/${encodeURIComponent(job.refnr)}?${detailParams.toString()}`}
        className="absolute inset-0"
      >
        <span className="sr-only">{job.titel} ansehen</span>
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-text-secondary text-xs font-medium">{job.beruf}</p>
        <h3 className="text-foreground mt-1 truncate text-base font-semibold">{job.titel}</h3>
        <p className="text-text-secondary mt-1 text-sm">{job.arbeitgeber}</p>
        <div className="text-text-secondary mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.plz} {job.ort}
          </span>
          {job.veroeffentlichungsdatum && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(job.veroeffentlichungsdatum).toLocaleDateString('de-DE')}
            </span>
          )}
        </div>
      </div>

      <SaveJobButton
        jobRefnr={job.refnr}
        titel={job.titel}
        arbeitgeber={job.arbeitgeber}
        ort={job.ort}
        initialIsSaved={isSaved}
        isAuthenticated={isAuthenticated}
      />
    </div>
  )
}
