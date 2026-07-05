import { formatPrice } from '@/lib/formatPrice'
import type { AdminOverviewStats } from '@/lib/adminAnalytics'

interface AnalyticsStatsProps {
  stats: AdminOverviewStats
}

const numberFormat = new Intl.NumberFormat('de-DE')
// Vertex AI rechnet in USD ab; bis zu 4 Nachkommastellen, damit auch
// Cent-Bruchteile einzelner Tage sichtbar sind statt "0,00 $"
const usdFormat = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

export function AnalyticsStats({ stats }: AnalyticsStatsProps) {
  const tiles = [
    { label: 'Nutzer gesamt', value: numberFormat.format(stats.totalUsers) },
    { label: 'Aktiv (7 Tage)', value: numberFormat.format(stats.activeLast7Days) },
    { label: 'Bewerbungen', value: numberFormat.format(stats.totalApplications) },
    { label: 'Zusammenfassungen im Cache', value: numberFormat.format(stats.cachedSummaries) },
    { label: 'Umsatz (Credits)', value: formatPrice(stats.revenueCents) },
    { label: 'KI-Kosten heute', value: usdFormat.format(stats.aiCostTodayUsd) },
    { label: 'KI-Kosten gesamt', value: usdFormat.format(stats.aiCostTotalUsd) },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map(({ label, value }) => (
        <div key={label} className="border-border bg-surface rounded-xl border p-4">
          <p className="text-foreground text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-text-secondary mt-1 text-xs">{label}</p>
        </div>
      ))}
    </div>
  )
}
