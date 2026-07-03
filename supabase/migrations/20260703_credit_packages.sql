-- Credit-Pakete (Monetarisierung, Schritt 1/5): Guthaben pro Feature plus
-- Verbrauchs-Log mit Dedupe pro Stelle. Die Gutschrift erfolgt später über
-- den Stripe-Webhook (Service Role) — Clients können Guthaben nur lesen,
-- Verbrauch läuft ausschließlich über die SECURITY-DEFINER-Funktionen.

CREATE TABLE IF NOT EXISTS public.credit_balances (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  summary_credits integer NOT NULL DEFAULT 0 CHECK (summary_credits >= 0),
  match_credits integer NOT NULL DEFAULT 0 CHECK (match_credits >= 0),
  letter_credits integer NOT NULL DEFAULT 0 CHECK (letter_credits >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;

-- Nur lesen: Gutschrift macht der Service Role (Stripe-Webhook), Abbuchung
-- die Funktionen unten — deshalb bewusst keine INSERT/UPDATE/DELETE-Policies.
CREATE POLICY credit_balances_select ON public.credit_balances
  FOR SELECT USING (auth.uid() = user_id);

-- Verbrauchs-Log: dieselbe Stelle kostet pro Feature nur EINMAL einen Credit
-- (UNIQUE), erneutes Generieren derselben Anzeige bleibt kostenlos.
CREATE TABLE IF NOT EXISTS public.credit_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  feature text NOT NULL CHECK (feature IN ('summary', 'match', 'letter')),
  job_refnr text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature, job_refnr)
);

ALTER TABLE public.credit_usages ENABLE ROW LEVEL SECURITY;

CREATE POLICY credit_usages_select ON public.credit_usages
  FOR SELECT USING (auth.uid() = user_id);

-- Atomarer Credit-Verbrauch. Nutzt auth.uid() statt eines Parameters, damit
-- niemand fremdes Guthaben verbrauchen kann. Rückgabe:
--   allowed  — Aufruf erlaubt (Guthaben vorhanden oder Stelle schon bezahlt)
--   remaining — Guthaben nach diesem Aufruf
--   charged  — true, wenn JETZT abgebucht wurde (Basis für refund_credit)
CREATE OR REPLACE FUNCTION public.consume_credit(p_feature text, p_job_refnr text)
RETURNS TABLE (allowed boolean, remaining integer, charged boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_balance integer;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 0, false;
    RETURN;
  END IF;
  IF p_feature NOT IN ('summary', 'match', 'letter') THEN
    RAISE EXCEPTION 'Unbekanntes Credit-Feature: %', p_feature;
  END IF;

  -- Guthaben-Zeile sperren, damit parallele Aufrufe nicht doppelt abbuchen
  SELECT CASE p_feature
      WHEN 'summary' THEN summary_credits
      WHEN 'match' THEN match_credits
      ELSE letter_credits
    END
    INTO v_balance
    FROM credit_balances
    WHERE user_id = v_user_id
    FOR UPDATE;

  IF v_balance IS NULL THEN
    -- Nie Credits gekauft — keine Guthaben-Zeile vorhanden
    RETURN QUERY SELECT false, 0, false;
    RETURN;
  END IF;

  -- Stelle bereits bezahlt? Erneut erlauben, ohne abzubuchen (Dedupe)
  IF EXISTS (
    SELECT 1 FROM credit_usages
    WHERE user_id = v_user_id AND feature = p_feature AND job_refnr = p_job_refnr
  ) THEN
    RETURN QUERY SELECT true, v_balance, false;
    RETURN;
  END IF;

  IF v_balance <= 0 THEN
    RETURN QUERY SELECT false, 0, false;
    RETURN;
  END IF;

  INSERT INTO credit_usages (user_id, feature, job_refnr)
    VALUES (v_user_id, p_feature, p_job_refnr);

  UPDATE credit_balances SET
    summary_credits = summary_credits - CASE WHEN p_feature = 'summary' THEN 1 ELSE 0 END,
    match_credits   = match_credits   - CASE WHEN p_feature = 'match'   THEN 1 ELSE 0 END,
    letter_credits  = letter_credits  - CASE WHEN p_feature = 'letter'  THEN 1 ELSE 0 END,
    updated_at = now()
    WHERE user_id = v_user_id;

  RETURN QUERY SELECT true, v_balance - 1, true;
END;
$$;

-- Rückerstattung, wenn die KI-Generierung NACH dem Abbuchen fehlschlägt —
-- nur sinnvoll, wenn consume_credit charged=true geliefert hat.
CREATE OR REPLACE FUNCTION public.refund_credit(p_feature text, p_job_refnr text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_deleted integer;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  DELETE FROM credit_usages
    WHERE user_id = v_user_id AND feature = p_feature AND job_refnr = p_job_refnr;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted > 0 THEN
    UPDATE credit_balances SET
      summary_credits = summary_credits + CASE WHEN p_feature = 'summary' THEN 1 ELSE 0 END,
      match_credits   = match_credits   + CASE WHEN p_feature = 'match'   THEN 1 ELSE 0 END,
      letter_credits  = letter_credits  + CASE WHEN p_feature = 'letter'  THEN 1 ELSE 0 END,
      updated_at = now()
      WHERE user_id = v_user_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_credit(text, text) FROM public;
REVOKE ALL ON FUNCTION public.refund_credit(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.consume_credit(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_credit(text, text) TO authenticated;
