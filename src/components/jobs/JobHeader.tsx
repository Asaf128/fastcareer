import { Building2, MapPin } from 'lucide-react'
import { SaveJobButton } from '@/components/jobs/SaveJobButton'

interface JobHeaderProps {
  jobRefnr: string
  titel: string
  arbeitgeber: string
  ort: string
  initialIsSaved: boolean
  isAuthenticated: boolean
}

export function JobHeader({
  jobRefnr,
  titel,
  arbeitgeber,
  ort,
  initialIsSaved,
  isAuthenticated,
}: JobHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-foreground text-2xl lg:text-3xl">{titel}</h1>
        <div className="text-text-secondary mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {arbeitgeber && (
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              {arbeitgeber}
            </span>
          )}
          {ort && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {ort}
            </span>
          )}
        </div>
      </div>

      {arbeitgeber && (
        <SaveJobButton
          jobRefnr={jobRefnr}
          titel={titel}
          arbeitgeber={arbeitgeber}
          ort={ort}
          initialIsSaved={initialIsSaved}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  )
}
