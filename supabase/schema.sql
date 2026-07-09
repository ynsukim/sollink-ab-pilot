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

create table if not exists public.session_archives (
  id bigint generated always as identity primary key,
  archived_at timestamptz default now(),
  label text not null,
  session_count integer not null default 0,
  sessions jsonb not null default '[]'::jsonb
);

create index if not exists sessions_variant_idx on public.sessions (variant);
create index if not exists sessions_created_at_idx on public.sessions (created_at desc);
create index if not exists events_session_id_idx on public.events (session_id);
create index if not exists session_archives_archived_at_idx on public.session_archives (archived_at desc);

alter table public.sessions enable row level security;
alter table public.events enable row level security;
alter table public.session_archives enable row level security;

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

create policy "anon read session_archives" on public.session_archives
  for select to anon using (true);

-- Archive all live sessions, then clear live tables (callable from admin)
create or replace function public.archive_and_reset_sessions(archive_label text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cnt integer;
  snapshot jsonb;
  archive_name text;
begin
  select count(*), coalesce(jsonb_agg(to_jsonb(s) order by s.created_at desc), '[]'::jsonb)
  into cnt, snapshot
  from public.sessions s;

  archive_name := coalesce(
    archive_label,
    'Archive ' || to_char(timezone('utc', now()), 'YYYY-MM-DD HH24:MI') || ' UTC'
  );

  if cnt > 0 then
    insert into public.session_archives (label, session_count, sessions)
    values (archive_name, cnt, snapshot);
  end if;

  delete from public.events where true;
  delete from public.sessions where true;

  return jsonb_build_object(
    'archived_count', cnt,
    'label', archive_name,
    'archived_at', now()
  );
end;
$$;

revoke all on function public.archive_and_reset_sessions(text) from public;
grant execute on function public.archive_and_reset_sessions(text) to anon;
