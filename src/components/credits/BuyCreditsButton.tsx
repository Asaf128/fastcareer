'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { createCheckoutSession } from '@/actions/checkout.actions'
import { Button } from '@/components/shared/Button'
import type { CreditPackageId } from '@/constants/creditPackages'

interface BuyCreditsButtonProps {
  packageId: CreditPackageId
  isAuthenticated: boolean
}

/** Startet den Stripe-Checkout — ohne Login geht's erst zur Anmeldung. */
export function BuyCreditsButton({ packageId, isAuthenticated }: BuyCreditsButtonProps) {
  const [isPending, startTransition] = useTransition()

  if (!isAuthenticated) {
    return (
      <Link
        href="/login?next=/credits"
        className="bg-accent hover:bg-accent-dark inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]"
      >
        Anmelden &amp; kaufen
      </Link>
    )
  }

  function handleBuy() {
    startTransition(async () => {
      const result = await createCheckoutSession({ packageId })
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      window.location.assign(result.url)
    })
  }

  return (
    <Button variant="accent" className="w-full" onClick={handleBuy} isLoading={isPending}>
      Jetzt kaufen
    </Button>
  )
}
