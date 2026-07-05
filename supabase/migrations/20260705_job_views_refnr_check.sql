-- Härtung nach Security-Review: job_refnr kommt aus einem URL-Parameter.
-- Die App validiert das Format bereits (recordJobView), diese Constraint
-- greift zusätzlich bei direkten PostgREST-Inserts mit eigener Session,
-- damit keine beliebig langen Strings abgelegt werden können.
alter table public.job_views
  add constraint job_views_refnr_length
  check (char_length(job_refnr) between 1 and 64);
