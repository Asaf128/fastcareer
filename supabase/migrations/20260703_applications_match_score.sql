-- Match-Score dauerhaft speichern (Feedback-Runde 2):
-- Score + Begründung werden pro Bewerbung abgelegt, damit ein erneuter
-- Seitenbesuch keinen zweiten Gemini-Call kostet (gleiche Logik wie beim
-- bereits gespeicherten Anschreiben).
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS match_score integer,
  ADD COLUMN IF NOT EXISTS match_begruendung jsonb;
