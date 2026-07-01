-- Cache-Poisoning-Fix (Security-Review #1):
-- Die offene INSERT-Policy (WITH CHECK true) erlaubte jedem Client, gefälschte
-- Job-Zusammenfassungen zu platzieren, die alle Besucher sehen. Inserts laufen
-- ab jetzt ausschließlich server-seitig über den Service-Role-Client (bypasst
-- RLS), daher braucht es keine INSERT-Policy mehr. Die Read-Policy bleibt.
DROP POLICY IF EXISTS job_summaries_insert ON public.job_summaries;
