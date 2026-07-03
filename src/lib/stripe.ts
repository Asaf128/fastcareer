import 'server-only'
import Stripe from 'stripe'

// Stripe-Server-Client für Checkout-Sessions und Webhook-Verifikation.
// Nur serverseitig — der Secret Key darf nie in den Browser.
let cachedStripe: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY nicht gesetzt.')
  }
  cachedStripe ??= new Stripe(key)
  return cachedStripe
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}
