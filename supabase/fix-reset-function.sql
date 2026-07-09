-- Run this in Supabase SQL Editor to fix "DELETE requires a WHERE clause"

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

grant execute on function public.archive_and_reset_sessions(text) to anon;
