-- SukiLedger multi-user database setup (Supabase SQL Editor)
create table if not exists public.sukiledger_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"customers":[],"transactions":[],"settings":{"storeName":"","ownerName":"","storePhone":""}}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.sukiledger_data enable row level security;
drop policy if exists "Users can read their own SukiLedger data" on public.sukiledger_data;
create policy "Users can read their own SukiLedger data" on public.sukiledger_data for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own SukiLedger data" on public.sukiledger_data;
create policy "Users can insert their own SukiLedger data" on public.sukiledger_data for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update their own SukiLedger data" on public.sukiledger_data;
create policy "Users can update their own SukiLedger data" on public.sukiledger_data for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.sukiledger_data to authenticated;
