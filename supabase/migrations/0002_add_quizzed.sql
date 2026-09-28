-- Adds a manual "has this plant come up in a past quiz" flag.
-- Run this once in the Supabase SQL editor for your project
-- (Dashboard → SQL Editor → New query → paste → Run).

alter table plants add column if not exists quizzed boolean not null default false;
