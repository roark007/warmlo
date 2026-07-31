-- Run once in the Supabase SQL editor (free tier).
-- Project: https://supabase.com/dashboard → New project → SQL → paste & run.

create table if not exists public.leads (
  id bigint generated always as identity primary key,
  name text not null,
  zip text not null,
  phone text not null,
  email text not null,
  job_type text not null,
  quoted_price numeric,
  source_page text not null default '/quote-check',
  created_at timestamptz not null default now()
);

-- Service role (server-side only) bypasses RLS; no public insert policy needed.
alter table public.leads enable row level security;

comment on table public.leads is 'Warmlo QuoteCheck fallback lead form submissions';
