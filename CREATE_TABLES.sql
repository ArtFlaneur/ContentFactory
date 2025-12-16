-- ContentFactory Database Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Create profiles table (if not exists)
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  is_pro boolean default false,
  generation_count integer default 0,
  onboarding_completed boolean default false,
  settings jsonb,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(email) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Policies for profiles
drop policy if exists "Users can view own profile." on profiles;
create policy "Users can view own profile." on profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trigger for auto-creating profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, settings)
  values (new.id, new.email, '{}'::jsonb);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create generated_posts table
-- Enables gen_random_uuid()
create extension if not exists "pgcrypto";

create table if not exists public.generated_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone not null default now(),
  request jsonb not null,
  post jsonb not null
);

create index if not exists generated_posts_user_created_idx
  on public.generated_posts (user_id, created_at desc);

alter table public.generated_posts enable row level security;

-- Policies for generated_posts
drop policy if exists "Users can read own generated posts" on public.generated_posts;
create policy "Users can read own generated posts" on public.generated_posts
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own generated posts" on public.generated_posts;
create policy "Users can insert own generated posts" on public.generated_posts
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own generated posts" on public.generated_posts;
create policy "Users can delete own generated posts" on public.generated_posts
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can update own generated posts" on public.generated_posts;
create policy "Users can update own generated posts" on public.generated_posts
  for update using (auth.uid() = user_id);
