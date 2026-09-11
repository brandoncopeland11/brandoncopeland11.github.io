create extension if not exists pgcrypto;

create or replace function public.is_analytics_owner()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'brandoncopeland11@gmail.com'
$$;

create table if not exists public.analytics_sessions (
  id text primary key,
  visitor_id text not null,
  started_at timestamptz not null,
  last_seen_at timestamptz not null,
  ended_at timestamptz,
  landing_path text,
  referrer text,
  user_agent text,
  viewport_width integer,
  viewport_height integer,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.analytics_page_views (
  id text primary key,
  session_id text not null,
  visitor_id text not null,
  path text not null,
  page_title text,
  referrer text,
  entered_at timestamptz not null,
  last_active_at timestamptz not null,
  duration_seconds integer not null default 0,
  max_scroll_pct numeric(5, 2) not null default 0,
  area_times jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.analytics_page_views
  add column if not exists cta_clicks jsonb not null default '[]'::jsonb;

create index if not exists analytics_sessions_started_at_idx
  on public.analytics_sessions (started_at desc);

create index if not exists analytics_sessions_visitor_id_idx
  on public.analytics_sessions (visitor_id);

create index if not exists analytics_page_views_entered_at_idx
  on public.analytics_page_views (entered_at desc);

create index if not exists analytics_page_views_path_idx
  on public.analytics_page_views (path);

create index if not exists analytics_page_views_session_id_idx
  on public.analytics_page_views (session_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.analytics_sessions to anon, authenticated;
grant select, insert, update on public.analytics_page_views to anon, authenticated;

alter table public.analytics_sessions enable row level security;
alter table public.analytics_page_views enable row level security;

drop policy if exists "public_insert_sessions" on public.analytics_sessions;
create policy "public_insert_sessions"
  on public.analytics_sessions
  for insert
  to public
  with check (true);

drop policy if exists "public_update_sessions" on public.analytics_sessions;
create policy "public_update_sessions"
  on public.analytics_sessions
  for update
  to public
  using (true)
  with check (true);

drop policy if exists "owner_read_sessions" on public.analytics_sessions;
create policy "owner_read_sessions"
  on public.analytics_sessions
  for select
  to authenticated
  using (public.is_analytics_owner());

drop policy if exists "public_insert_page_views" on public.analytics_page_views;
create policy "public_insert_page_views"
  on public.analytics_page_views
  for insert
  to public
  with check (true);

drop policy if exists "public_update_page_views" on public.analytics_page_views;
create policy "public_update_page_views"
  on public.analytics_page_views
  for update
  to public
  using (true)
  with check (true);

drop policy if exists "owner_read_page_views" on public.analytics_page_views;
create policy "owner_read_page_views"
  on public.analytics_page_views
  for select
  to authenticated
  using (public.is_analytics_owner());
