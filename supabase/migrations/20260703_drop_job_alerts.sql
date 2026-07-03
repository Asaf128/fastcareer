-- Job-Alerts-Feature komplett entfernt (Betreiber-Entscheidung): kein Code
-- referenziert die Tabelle mehr, der tägliche Cron-Versand ist ebenfalls
-- entfernt (vercel.json).
DROP TABLE IF EXISTS public.job_alerts;
