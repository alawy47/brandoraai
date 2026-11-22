-- BRANDORA database schema for Supabase (Postgres).
-- Run in the Supabase SQL editor, or save as a migration with the Supabase CLI.

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  input       jsonb not null,            -- the brief: name, category, audience, personality, colors, language
  concepts    jsonb not null,            -- the 3 generated concepts (same shape as src/lib/generator.js)
  selected    smallint not null default 0,
  status      text not null default 'progress' check (status in ('progress', 'completed')),
  favorite    boolean not null default false,
  seed        bigint,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists projects_user_updated_idx on public.projects (user_id, updated_at desc);

-- Keep updated_at current on every edit.
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- Row level security: each user sees and changes only their own projects.
alter table public.projects enable row level security;

create policy "read own projects"   on public.projects for select using (auth.uid() = user_id);
create policy "insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "update own projects" on public.projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own projects" on public.projects for delete using (auth.uid() = user_id);

-- Usage log, written by the API server (service role) for quotas and billing.
create table if not exists public.generations (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('brand', 'logos')),
  created_at  timestamptz not null default now()
);
alter table public.generations enable row level security;
create policy "read own generations" on public.generations for select using (auth.uid() = user_id);

-- Storage bucket for exported PDFs and PNGs (private; files live under <user_id>/...).
insert into storage.buckets (id, name, public) values ('exports', 'exports', false) on conflict do nothing;
create policy "users manage own exports" on storage.objects for all
  using (bucket_id = 'exports' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'exports' and (storage.foldername(name))[1] = auth.uid()::text);
