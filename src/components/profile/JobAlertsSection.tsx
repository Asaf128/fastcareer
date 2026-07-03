'use client'

import { useTransition } from 'react'
import { BellRing, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteJobAlert } from '@/actions/alerts.actions'

export interface JobAlertItem {
  id: string
  was: string
  wo: string
  arbeitszeit: string
}

interface JobAlertsSectionProps {
  alerts: JobAlertItem[]
}

const ARBEITSZEIT_LABELS: Record<string, string> = {
  vz: 'Vollzeit',
  tz: 'Teilzeit',
  mj: 'Minijob',
  ausbildung: 'Ausbildung',
  ho: 'Home-Office',
  snw: 'Schicht/Nacht/Wochenende',
}

export function JobAlertsSection({ alerts }: JobAlertsSectionProps) {
  const [, startTransition] = useTransition()

  if (alerts.length === 0) return null

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteJobAlert(id)
      if (result.error) toast.error(result.error)
      else toast.success('Job-Alert gelöscht.')
    })
  }

  return (
    <div className="border-border mt-12 rounded-xl border p-6">
      <h2 className="text-foreground flex items-center gap-2 text-base font-semibold">
        <BellRing className="text-accent h-4 w-4" />
        Deine Job-Alerts
      </h2>
      <p className="text-text-secondary mt-1 text-sm">
        Für diese Suchen bekommst du täglich neue Treffer per E-Mail.
      </p>

      <ul className="mt-4 space-y-2">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className="border-border bg-surface flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-sm"
          >
            <span className="min-w-0 truncate">
              <span className="text-foreground font-medium">{alert.was}</span>
              {alert.wo && <span className="text-text-secondary"> · {alert.wo}</span>}
              {alert.arbeitszeit && ARBEITSZEIT_LABELS[alert.arbeitszeit] && (
                <span className="text-text-secondary">
                  {' '}
                  · {ARBEITSZEIT_LABELS[alert.arbeitszeit]}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(alert.id)}
              aria-label={`Job-Alert "${alert.was}" löschen`}
              className="text-text-secondary hover:text-error shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
