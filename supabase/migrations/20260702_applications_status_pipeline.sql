-- Bewerbungsstatus als Pipeline (UX-Review #16):
-- Gespeichert → Beworben → Interview → Zusage / Absage.
-- Die alten Booleans applied/answered bleiben vorerst bestehen (kein Code
-- schreibt sie nach dem Deploy noch, Backfill unten übernimmt die Werte).
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'gespeichert'
  CHECK (status IN ('gespeichert', 'beworben', 'interview', 'zusage', 'absage'));

UPDATE public.applications SET status = 'beworben' WHERE applied = true;
UPDATE public.applications SET status = 'interview' WHERE answered = true;
