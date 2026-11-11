-- Security-Fix (Supabase-Advisor): refund_credit war für authenticated —
-- in Prod laut Advisor sogar für anon — direkt per REST aufrufbar
-- (/rest/v1/rpc/refund_credit). Ein angemeldeter Nutzer konnte sich damit
-- nach jeder erfolgreichen KI-Generierung den Credit selbst zurückerstatten
-- und so mit einem einzigen gekauften Credit unbegrenzt generieren.
--
-- Refunds macht ab jetzt ausschließlich der Server (Service Role) mit
-- explizitem p_user_id — gleiches Muster wie grant_credits.
-- consume_credit bleibt für authenticated erlaubt (kann nur das eigene
-- Guthaben belasten), anon wird explizit entzogen.

DROP FUNCTION IF EXISTS public.refund_credit(text, text);

CREATE OR REPLACE FUNCTION public.refund_credit(
  p_user_id uuid,
  p_feature text,
  p_job_refnr text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  DELETE FROM credit_usages
    WHERE user_id = p_user_id AND feature = p_feature AND job_refnr = p_job_refnr;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  IF v_deleted > 0 THEN
    UPDATE credit_balances SET
      summary_credits = summary_credits + CASE WHEN p_feature = 'summary' THEN 1 ELSE 0 END,
      match_credits   = match_credits   + CASE WHEN p_feature = 'match'   THEN 1 ELSE 0 END,
      letter_credits  = letter_credits  + CASE WHEN p_feature = 'letter'  THEN 1 ELSE 0 END,
      updated_at = now()
      WHERE user_id = p_user_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.refund_credit(uuid, text, text) FROM public;
REVOKE ALL ON FUNCTION public.refund_credit(uuid, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.refund_credit(uuid, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.refund_credit(uuid, text, text) TO service_role;

-- consume_credit: anon-Ausführung unterbinden (auth.uid() wäre ohnehin NULL,
-- aber die Funktion soll anonym gar nicht erst erreichbar sein)
REVOKE ALL ON FUNCTION public.consume_credit(text, text) FROM public;
REVOKE ALL ON FUNCTION public.consume_credit(text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.consume_credit(text, text) TO authenticated;
