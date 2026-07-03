'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { getCreditPackage } from '@/constants/creditPackages'
import { APP_URL } from '@/constants/config'

const inputSchema = z.object({
  packageId: z.enum(['starter', 'jobsuche']),
})

/**
 * Startet den Stripe-Checkout für ein Credit-Paket. Die Gutschrift passiert
 * NICHT hier und auch nicht auf der Danke-Seite, sondern ausschließlich im
 * Webhook (signaturgeprüft, idempotent), sonst könnte man sich Credits
 * ohne Zahlung erschleichen.
 */
export async function createCheckoutSession(
  input: z.infer<typeof inputSchema>
): Promise<{ error: string } | { error: null; url: string }> {
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) return { error: 'Unbekanntes Paket.' }

  const pkg = getCreditPackage(parsed.data.packageId)
  if (!pkg) return { error: 'Unbekanntes Paket.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Bitte zuerst anmelden.' }

  if (!isStripeConfigured()) {
    return { error: 'Zahlungen sind noch nicht freigeschaltet. Bitte versuche es später.' }
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: pkg.priceCents,
            product_data: {
              name: `Fastcareer ${pkg.name}-Paket: ${pkg.credits} Credits`,
              description: `${pkg.credits} KI-Zusammenfassungen + ${pkg.credits} Match-Berechnungen + ${pkg.credits} Anschreiben. Credits verfallen nicht.`,
            },
          },
        },
      ],
      // Der Webhook liest daraus, wem was gutgeschrieben wird
      metadata: {
        user_id: user.id,
        package_id: pkg.id,
      },
      // Widerruf bei digitalen Inhalten: sofortige Bereitstellung + Erlöschen
      // des Widerrufsrechts, Zustimmung direkt im Checkout (§ 356 Abs. 5 BGB)
      custom_text: {
        submit: {
          message:
            'Du stimmst zu, dass wir die Credits sofort bereitstellen, und bestätigst, dass dein Widerrufsrecht damit erlischt.',
        },
      },
      success_url: `${APP_URL}/credits/danke`,
      cancel_url: `${APP_URL}/credits`,
    })
    if (!session.url) return { error: 'Checkout konnte nicht gestartet werden.' }
    return { error: null, url: session.url }
  } catch (error) {
    console.error('Stripe-Checkout fehlgeschlagen:', error)
    return { error: 'Checkout konnte nicht gestartet werden. Bitte versuche es erneut.' }
  }
}
