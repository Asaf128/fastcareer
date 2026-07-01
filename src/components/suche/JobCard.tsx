import Link from 'next/link'
import { FavoriteButton } from '@/components/suche/FavoriteButton'
import type { JobListing } from '@/types/job.types'

interface JobCardProps {
  job: JobListing
  isFavorite?: boolean
  isAuthenticated?: boolean
}

export function JobCard({ job, isFavorite = false, isAuthenticated = false }: JobCardProps) {
  const detailParams = new URLSearchParams({
    titel: job.titel,
    arbeitgeber: job.arbeitgeber,
    ort: `${job.plz} ${job.ort}`.trim(),
  })

  return (
    <div className="border-border hover:border-accent relative flex items-start justify-between gap-4 border p-6 transition-colors duration-300">
      <Link
        href={`/suche/${encodeURIComponent(job.refnr)}?${detailParams.toString()}`}
        className="absolute inset-0"
      >
        <span className="sr-only">{job.titel} ansehen</span>
      </Link>

      <div>
        <p className="text-text-secondary text-xs tracking-[0.2em] uppercase">{job.beruf}</p>
        <h3 className="text-foreground mt-2 text-xl font-normal normal-case">{job.titel}</h3>
        <p className="text-text-secondary mt-3 text-sm">{job.arbeitgeber}</p>
        <div className="text-text-secondary mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span>
            {job.plz} {job.ort}
          </span>
          {job.veroeffentlichungsdatum && (
            <span>
              Veröffentlicht: {new Date(job.veroeffentlichungsdatum).toLocaleDateString('de-DE')}
            </span>
          )}
        </div>
      </div>

      <FavoriteButton
        jobRefnr={job.refnr}
        titel={job.titel}
        arbeitgeber={job.arbeitgeber}
        ort={job.ort}
        initialIsFavorite={isFavorite}
        isAuthenticated={isAuthenticated}
      />
    </div>
  )
}
