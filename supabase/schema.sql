-- Run this in Supabase SQL Editor (https://supabase.com → your project → SQL)

create table if not exists public.sessions (
  id bigint generated always as identity primary key,
  session_id text not null unique,
  variant text not null check (variant in ('A', 'B')),
  started_at timestamptz,
  ended_at timestamptz,
  total_time_ms integer default 0,
  section_dwell jsonb default '{}'::jsonb,
  max_scroll_depth numeric default 0,
  cta_clicks jsonb default '[]'::jsonb,
  back_pressed boolean default false,
  back_pressed_at timestamptz,
  user_agent text,
  viewport text,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id bigint generated always as identity primary key,
  session_id text not null,
  variant text not null,
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists sessions_variant_idx on public.sessions (variant);
create index if not exists sessions_created_at_idx on public.sessions (created_at desc);
create index if not exists events_session_id_idx on public.events (session_id);

alter table public.sessions enable row level security;
alter table public.events enable row level security;

-- Allow anonymous inserts (prototype participants)
create policy "anon insert sessions" on public.sessions
  for insert to anon with check (true);

create policy "anon insert events" on public.events
  for insert to anon with check (true);

-- Allow anonymous reads for admin dashboard (pilot only — tighten for production)
create policy "anon read sessions" on public.sessions
  for select to anon using (true);

create policy "anon read events" on public.events
  for select to anon using (true);
