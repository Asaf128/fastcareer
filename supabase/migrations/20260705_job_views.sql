-- Job-Ansichten-Log: erfasst, wann ein angemeldeter Nutzer eine
-- Job-Detailseite geöffnet hat (für das Admin-Analytics-Dashboard).
-- Append-only wie credit_usages, deshalb bewusst ohne updated_at.
create table public.job_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_refnr text not null,
  created_at timestamptz not null default now()
);

alter table public.job_views enable row level security;

-- Nutzer loggen nur eigene Ansichten; gelesen wird ausschließlich
-- serverseitig über den Service-Role-Client (Admin-Dashboard), daher
-- bewusst keine SELECT-Policy.
create policy "insert_own_views" on public.job_views
  for insert with check ((select auth.uid()) = user_id);

-- Aggregation im Admin-Dashboard läuft über user_id + jüngste Ansicht
create index job_views_user_created_idx on public.job_views (user_id, created_at desc);
