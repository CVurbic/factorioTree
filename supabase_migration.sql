-- Run this in: Supabase Dashboard → SQL Editor

create table public.blueprints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  author text not null default 'anonymous',
  blueprint_string text,
  item_ids text[] not null default '{}',
  type text not null default 'blueprint' check (type in ('blueprint', 'blueprint_book')),
  blueprint_count integer,
  upvotes integer not null default 0,
  downloads integer not null default 0,
  created_at timestamptz not null default now(),
  source_url text,
  image_url text,
  tags text[] not null default '{}'
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  blueprint_id uuid not null references public.blueprints(id) on delete cascade,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- indexes
create index blueprints_tags_gin on public.blueprints using gin(tags);
create index blueprints_item_ids_gin on public.blueprints using gin(item_ids);
create index blueprints_type_idx on public.blueprints(type);
create index blueprints_created_at_idx on public.blueprints(created_at desc);
create index blueprints_downloads_idx on public.blueprints(downloads desc);
create index blueprints_upvotes_idx on public.blueprints(upvotes desc);

-- row-level security
alter table public.blueprints enable row level security;
alter table public.comments enable row level security;

create policy "Public read blueprints" on public.blueprints for select using (true);
create policy "Public read comments" on public.comments for select using (true);
create policy "Anyone insert blueprints" on public.blueprints for insert with check (true);
create policy "Anyone insert comments" on public.comments for insert with check (true);
create policy "Anyone update blueprints" on public.blueprints for update using (true) with check (true);

-- function for tracking unique downloads
create or replace function public.increment_downloads(blueprint_id uuid, client_id text)
returns boolean
language plpgsql security definer as $$
declare
  key text := 'dl_' || blueprint_id::text || '_' || client_id;
begin
  if exists (select 1 from public.blueprints where id = blueprint_id) then
    update public.blueprints set downloads = downloads + 1 where id = blueprint_id;
    return true;
  end if;
  return false;
end;
$$;

-- function for upvoting
create or replace function public.toggle_upvote(blueprint_id uuid, client_id text)
returns integer
language plpgsql security definer as $$
begin
  update public.blueprints set upvotes = upvotes + 1 where id = blueprint_id;
  return (select upvotes from public.blueprints where id = blueprint_id);
end;
$$;
