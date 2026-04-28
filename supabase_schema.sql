-- ============================================================
-- MY AI Agent — Supabase テーブル設定
-- Supabase ダッシュボード > SQL Editor に貼り付けて「Run」
-- ============================================================

create table if not exists public.users (
  id                 text primary key,
  name               text not null,
  email              text not null unique,
  password           text not null default '',
  plan               text not null default 'free',
  balance_jpy        numeric not null default 0,
  agents             jsonb not null default '[]',
  usage_count        integer not null default 0,
  billing_history    jsonb not null default '[]',
  stripe_customer_id text,
  google_id          text,
  verified           boolean not null default false,
  verify_token       text,
  reset_token        text,
  reset_expiry       bigint,
  deleted            boolean not null default false,
  created_at         timestamptz not null default now()
);

create index if not exists users_email_idx    on public.users(email);
create index if not exists users_google_idx   on public.users(google_id);
create index if not exists users_verify_idx   on public.users(verify_token);
create index if not exists users_reset_idx    on public.users(reset_token);

alter table public.users enable row level security;
create policy "service_role_all" on public.users
  for all using (true) with check (true);

-- 確認
-- select count(*) from public.users;
