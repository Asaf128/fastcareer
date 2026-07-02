-- Straße & Hausnummer im Profil (für die Absender-Anschrift im
-- DIN-formatierten Anschreiben-PDF). Ort/PLZ steckt bereits in location.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS street text;
