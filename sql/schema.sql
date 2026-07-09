create extension if not exists "pgcrypto";

create table if not exists public.performances (
  id uuid primary key default gen_random_uuid(),
  athlete text not null default 'Sean Williams',
  event_name text not null,
  mark text not null,
  mark_value numeric,
  month text,
  year integer,
  source text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists performances_event_idx on public.performances(event_name);
create index if not exists performances_athlete_idx on public.performances(athlete);
create index if not exists performances_year_idx on public.performances(year);
