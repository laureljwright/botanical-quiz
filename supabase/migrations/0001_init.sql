-- Botanical Quiz schema.
-- Run this once in the Supabase SQL editor for your project
-- (Dashboard → SQL Editor → New query → paste → Run).

create extension if not exists pgcrypto;

create table if not exists plants (
  id uuid primary key default gen_random_uuid(),
  botanical_name text not null,
  common_name text not null default '',
  type text not null default '',
  origin text not null default '',
  family_name text not null default '',
  light text not null default '',
  water text not null default '',
  fun_fact text,
  photo_urls text[] not null default '{}',
  week_added int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists quiz_stats (
  plant_id uuid primary key references plants(id) on delete cascade,
  times_seen int not null default 0,
  times_correct int not null default 0,
  last_seen_at timestamptz
);

alter table plants enable row level security;
alter table quiz_stats enable row level security;

-- Single-user app: any authenticated (logged in) user has full access.
create policy "authenticated full access to plants"
  on plants for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated full access to quiz_stats"
  on quiz_stats for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Photo storage bucket.
insert into storage.buckets (id, name, public)
values ('plant-photos', 'plant-photos', true)
on conflict (id) do nothing;

create policy "authenticated upload to plant-photos"
  on storage.objects for insert
  with check (bucket_id = 'plant-photos' and auth.role() = 'authenticated');

create policy "authenticated manage plant-photos"
  on storage.objects for all
  using (bucket_id = 'plant-photos' and auth.role() = 'authenticated');

create policy "public read plant-photos"
  on storage.objects for select
  using (bucket_id = 'plant-photos');
