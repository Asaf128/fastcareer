-- Credit-Käufe (Monetarisierung, Schritt 2/5): Kauf-Log als Audit-Trail und
-- Idempotenz-Anker für den Stripe-Webhook — dieselbe Checkout-Session kann
-- nie doppelt gutgeschrieben werden (UNIQUE auf stripe_session_id).

CREATE TABLE IF NOT EXISTS public.credit_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  stripe_session_id text NOT NULL UNIQUE,
  package_id text NOT NULL,
  credits integer NOT NULL,
  amount_cents integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

-- Nur lesen (eigene Käufe): Schreiben macht ausschließlich der Webhook via
-- grant_credits (Service Role).
CREATE POLICY credit_purchases_select ON public.credit_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Atomare Gutschrift nach bezahlter Stripe-Checkout-Session: legt den
-- Kauf-Eintrag an und erhöht das Guthaben für ALLE drei Features um die
-- Paketgröße. Rückgabe false = Session war schon verbucht (Duplikat,
-- z. B. Webhook-Retry) — dann wird nichts erneut gutgeschrieben.
CREATE OR REPLACE FUNCTION public.grant_credits(
  p_user_id uuid,
  p_stripe_session_id text,
  p_package_id text,
  p_credits integer,
  p_amount_cents integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_credits <= 0 THEN
    RAISE EXCEPTION 'Ungültige Credit-Anzahl: %', p_credits;
  END IF;

  INSERT INTO credit_purchases (user_id, stripe_session_id, package_id, credits, amount_cents)
    VALUES (p_user_id, p_stripe_session_id, p_package_id, p_credits, p_amount_cents)
    ON CONFLICT (stripe_session_id) DO NOTHING;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO credit_balances (user_id, summary_credits, match_credits, letter_credits)
    VALUES (p_user_id, p_credits, p_credits, p_credits)
    ON CONFLICT (user_id) DO UPDATE SET
      summary_credits = credit_balances.summary_credits + p_credits,
      match_credits   = credit_balances.match_credits + p_credits,
      letter_credits  = credit_balances.letter_credits + p_credits,
      updated_at = now();

  RETURN true;
END;
$$;

-- Gutschrift ist ausschließlich Sache des Stripe-Webhooks (Service Role)
REVOKE ALL ON FUNCTION public.grant_credits(uuid, text, text, integer, integer) FROM public;
REVOKE ALL ON FUNCTION public.grant_credits(uuid, text, text, integer, integer) FROM anon;
REVOKE ALL ON FUNCTION public.grant_credits(uuid, text, text, integer, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.grant_credits(uuid, text, text, integer, integer) TO service_role;
