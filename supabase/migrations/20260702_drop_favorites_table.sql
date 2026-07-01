-- Aufräumen (Code-Review #13): favorites war die Vorgänger-Tabelle von
-- applications. Die Daten wurden bereits migriert, kein Code referenziert
-- sie mehr — sie diente nur noch als Backup während der Übergangszeit.
DROP TABLE IF EXISTS public.favorites;
