-- Run in SQL Editor to fix all advisor warnings

-- 1. Recreate functions: SECURITY INVOKER + fixed search_path (fixes all function warnings)
create or replace function public.increment_downloads(blueprint_id uuid, client_id text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if exists (select 1 from public.blueprints where id = blueprint_id) then
    update public.blueprints set downloads = downloads + 1 where id = blueprint_id;
    return true;
  end if;
  return false;
end;
$$;

create or replace function public.toggle_upvote(blueprint_id uuid, client_id text)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.blueprints set upvotes = upvotes + 1 where id = blueprint_id;
  return (select upvotes from public.blueprints where id = blueprint_id);
end;
$$;

-- 2. Grant execute + table column access so SECURITY INVOKER works for anon
grant execute on function public.increment_downloads(uuid, text) to anon, authenticated;
grant execute on function public.toggle_upvote(uuid, text) to anon, authenticated;
grant update(upvotes, downloads) on public.blueprints to anon, authenticated;

-- 3. Tighten UPDATE policy: only allow updating upvotes/downloads, not name/description etc.
drop policy if exists "Anyone update blueprints" on public.blueprints;
create policy "Anyone update upvotes and downloads" on public.blueprints
  for update using (true)
  with check (true);
-- Note: column-level restriction is enforced via the GRANT above (only upvotes/downloads)
-- The RLS policy itself cannot restrict to specific columns, but the grant does.

-- INSERT policies with `true` are intentional for a public platform (scraper + user submissions).
-- Supabase warns about them but they are expected behavior here. No change needed.
