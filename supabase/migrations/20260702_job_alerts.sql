-- Job-Alerts (Wachstums-Review #23): gespeicherte Suchen, die per täglichem
-- Cron (Vercel) mit neuen Treffern per E-Mail (Resend) versorgt werden.
CREATE TABLE IF NOT EXISTS public.job_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  was text NOT NULL,
  wo text NOT NULL DEFAULT '',
  umkreis integer NOT NULL DEFAULT 25,
  arbeitszeit text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_sent_at timestamptz,
  UNIQUE (user_id, was, wo, arbeitszeit)
);

ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY job_alerts_select ON public.job_alerts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY job_alerts_insert ON public.job_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY job_alerts_delete ON public.job_alerts
  FOR DELETE USING (auth.uid() = user_id);
