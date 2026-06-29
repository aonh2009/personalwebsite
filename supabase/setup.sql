-- setup.sql
-- Run this in Supabase > SQL Editor. It creates the posts table the website reads,
-- locks writes to the server only, and schedules the daily post job.

-- 1. The table the site reads and the daily job writes to
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  cat         text not null default 'news',
  title       text not null,
  body        text not null,
  source_url  text,
  status      text not null default 'published',
  likes       int  not null default 0,
  comments    int  not null default 0,
  reposts     int  not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists posts_created_idx on public.posts (created_at desc);

-- 2. Anyone can read published posts, nobody can write from the browser.
--    The daily job writes with the service role key, which bypasses RLS.
alter table public.posts enable row level security;

drop policy if exists "public can read published" on public.posts;
create policy "public can read published"
  on public.posts for select
  using (status = 'published');

-- 3. Optional: seed one row so the site is not empty before the first job runs
insert into public.posts (cat, title, body)
values ('ob', 'The feed is live',
  'This space now updates on its own every morning, pulling fintech and open banking news and turning it into a short take. More to follow.');

-- 4. Schedule the daily job.
--    Replace <PROJECT_REF> with your Supabase project ref and <CRON_SECRET>
--    with the same secret you set in the edge function.
--    06:00 UTC is 09:00 in Riyadh.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'daily-post',
  '0 6 * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/daily-post',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','<CRON_SECRET>'),
    body    := '{}'::jsonb
  );
  $$
);

-- To stop it later:  select cron.unschedule('daily-post');
-- To run it once now for a test, call the function URL with the x-cron-secret header.
