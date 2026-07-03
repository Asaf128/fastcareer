import { Check } from 'lucide-react'
import { BuyCreditsButton } from '@/components/credits/BuyCreditsButton'
import { cn } from '@/lib/cn'
import { formatPrice, type CreditPackage } from '@/constants/creditPackages'

interface PackageCardProps {
  pkg: CreditPackage
  isAuthenticated: boolean
}

export function PackageCard({ pkg, isAuthenticated }: PackageCardProps) {
  const features = [
    `${pkg.credits} KI-Zusammenfassungen`,
    `${pkg.credits} Match-Berechnungen`,
    `${pkg.credits} KI-Anschreiben`,
    'Credits verfallen nicht',
  ]

  return (
    <div
      className={cn(
        'bg-background relative flex flex-col rounded-xl border p-6 shadow-sm lg:p-8',
        pkg.highlight ? 'border-accent border-2' : 'border-border'
      )}
    >
      {pkg.highlight && (
        <span className="bg-accent absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-medium text-white">
          Beliebt
        </span>
      )}
      <h2 className="text-foreground text-lg font-semibold">{pkg.name}</h2>
      <p className="text-text-secondary mt-1 text-sm">{pkg.tagline}</p>
      <p className="text-foreground mt-4 text-3xl font-semibold">
        {formatPrice(pkg.priceCents)}
        <span className="text-text-secondary ml-1.5 text-sm font-normal">einmalig</span>
      </p>
      <ul className="mt-5 mb-6 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="text-text-primary flex items-center gap-2 text-sm">
            <Check className="text-accent h-4 w-4 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <BuyCreditsButton packageId={pkg.id} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  )
}
