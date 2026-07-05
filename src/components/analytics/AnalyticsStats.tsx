import { formatPrice } from '@/lib/formatPrice'
import type { AdminOverviewStats } from '@/lib/adminAnalytics'

interface AnalyticsStatsProps {
  stats: AdminOverviewStats
}

const numberFormat = new Intl.NumberFormat('de-DE')

export function AnalyticsStats({ stats }: AnalyticsStatsProps) {
  const tiles = [
    { label: 'Nutzer gesamt', value: numberFormat.format(stats.totalUsers) },
    { label: 'Aktiv (7 Tage)', value: numberFormat.format(stats.activeLast7Days) },
    { label: 'Bewerbungen', value: numberFormat.format(stats.totalApplications) },
    { label: 'Zusammenfassungen im Cache', value: numberFormat.format(stats.cachedSummaries) },
    { label: 'Umsatz (Credits)', value: formatPrice(stats.revenueCents) },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map(({ label, value }) => (
        <div key={label} className="border-border bg-surface rounded-xl border p-4">
          <p className="text-foreground text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-text-secondary mt-1 text-xs">{label}</p>
        </div>
      ))}
    </div>
  )
}
