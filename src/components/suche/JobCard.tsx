import Link from 'next/link'
import type { JobListing } from '@/types/job.types'

interface JobCardProps {
  job: JobListing
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/suche/${encodeURIComponent(job.refnr)}`}
      className="border-border hover:border-accent block border p-6 transition-colors duration-300"
    >
      <p className="text-text-secondary text-xs tracking-[0.2em] uppercase">{job.beruf}</p>
      <h3 className="text-foreground mt-2 text-xl font-normal normal-case">{job.titel}</h3>
      <p className="text-text-secondary mt-3 text-sm">{job.arbeitgeber}</p>
      <div className="text-text-secondary mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span>
          {job.plz} {job.ort}
        </span>
        {job.veroeffentlichungsdatum && (
          <span>Veröffentlicht: {new Date(job.veroeffentlichungsdatum).toLocaleDateString('de-DE')}</span>
        )}
      </div>
    </Link>
  )
}
