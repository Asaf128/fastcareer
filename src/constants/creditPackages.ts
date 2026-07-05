/**
 * Credit-Pakete: Einmalkauf statt Abo. Ein Paket schaltet pro Feature-Typ
 * DIESELBE Anzahl frei, das 30er-Paket sind also 30 Zusammenfassungen
 * UND 30 Match-Berechnungen UND 30 Anschreiben. Credits verfallen nicht;
 * dieselbe Stelle kostet pro Feature nur einmal einen Credit.
 * Bei Größenänderung auch die konkreten Zahlen in credits/page.tsx
 * und agb/page.tsx (§ 2) anpassen.
 */
export type CreditPackageId = 'starter' | 'jobsuche'

export interface CreditPackage {
  id: CreditPackageId
  name: string
  credits: number
  /** Bruttopreis in Cent (EUR) */
  priceCents: number
  tagline: string
  highlight: boolean
}

export const CREDIT_PACKAGES: readonly CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 10,
    priceCents: 199,
    tagline: 'Zum Ausprobieren, für die ersten Bewerbungen.',
    highlight: false,
  },
  {
    id: 'jobsuche',
    name: 'Jobsuche',
    credits: 30,
    priceCents: 499,
    tagline: 'Für die komplette Jobsuche, bis der Vertrag unterschrieben ist.',
    highlight: true,
  },
] as const

export function getCreditPackage(id: string | undefined): CreditPackage | null {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id) ?? null
}

export function formatPrice(priceCents: number): string {
  return `${(priceCents / 100).toFixed(2).replace('.', ',')} €`
}
