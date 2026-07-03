import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCreditPackage } from '@/constants/creditPackages'

// Stripe-Webhook: einziger Ort, an dem Credits gutgeschrieben werden.
// Signaturprüfung gegen STRIPE_WEBHOOK_SECRET; Idempotenz übernimmt
// grant_credits (UNIQUE auf stripe_session_id): Stripe-Retries und
// doppelte Events sind damit harmlos.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get('stripe-signature')
  if (!secret || !signature) {
    return NextResponse.json({ error: 'Webhook nicht konfiguriert.' }, { status: 400 })
  }

  const payload = await request.text()
  let event: Stripe.Event
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, signature, secret)
  } catch (error) {
    console.error('Stripe-Webhook-Signatur ungültig:', error)
    return NextResponse.json({ error: 'Ungültige Signatur.' }, { status: 400 })
  }

  // completed deckt Karten & Co. ab; async_payment_succeeded verzögerte
  // Methoden (z. B. SEPA/Klarna). payment_status schützt vor Gutschrift
  // vor Zahlungseingang
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ received: true })
    }

    const userId = session.metadata?.user_id
    const pkg = getCreditPackage(session.metadata?.package_id)
    if (!userId || !pkg) {
      // Session gehört nicht zu einem Credit-Kauf (oder Metadaten fehlen),
      // daher 200, damit Stripe nicht endlos erneut zustellt
      console.error('Stripe-Session ohne verwertbare Metadaten:', session.id)
      return NextResponse.json({ received: true })
    }

    const admin = createAdminClient()
    const { data: granted, error } = await admin.rpc('grant_credits', {
      p_user_id: userId,
      p_stripe_session_id: session.id,
      p_package_id: pkg.id,
      p_credits: pkg.credits,
      p_amount_cents: session.amount_total ?? pkg.priceCents,
    })
    if (error) {
      // 500 → Stripe stellt das Event erneut zu, keine Gutschrift geht verloren
      console.error('Credit-Gutschrift fehlgeschlagen:', error.code ?? error.message)
      return NextResponse.json({ error: 'Gutschrift fehlgeschlagen.' }, { status: 500 })
    }
    if (granted === false) {
      console.warn('Stripe-Session bereits verbucht (Duplikat):', session.id)
    }
  }

  return NextResponse.json({ received: true })
}
