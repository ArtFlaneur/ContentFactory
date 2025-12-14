# Supabase Setup for Content Factory

To enable user persistence and limits, you need to set up a Supabase project.

## 1. Create Project
Go to [database.new](https://database.new) and create a new project.

## 2. Run SQL Query
Go to the **SQL Editor** in your Supabase dashboard and run the following script to create the `profiles` table:

```sql
-- Create a table for public profiles
create table profiles (
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
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

-- The app only needs each user to read/update their own profile.
drop policy if exists "Users can view own profile." on profiles;
create policy "Users can view own profile." on profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

-- Important: `upsert` (INSERT ... ON CONFLICT DO UPDATE) requires both INSERT and UPDATE policies.
-- Explicit WITH CHECK helps avoid confusing upsert failures.
drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Auth
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, settings)
  values (new.id, new.email, '{}'::jsonb);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- --------------------------------------------
-- Generated Posts History (cross-device)
-- --------------------------------------------

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

create policy "Users can read own generated posts" on public.generated_posts
  for select using (auth.uid() = user_id);

create policy "Users can insert own generated posts" on public.generated_posts
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own generated posts" on public.generated_posts
  for delete using (auth.uid() = user_id);

-- (Optional) allow updates if you later add rename/tags
create policy "Users can update own generated posts" on public.generated_posts
  for update using (auth.uid() = user_id);
```

### Already have a `profiles` table?

If you created `profiles` earlier (for example with only `onboarding_completed`) the app will not be able to save onboarding data, because it stores onboarding answers in `profiles.settings` (JSON).

Run this migration to add the missing columns safely:

```sql
alter table public.profiles
  add column if not exists email text,
  add column if not exists is_pro boolean default false,
  add column if not exists generation_count integer default 0,
  add column if not exists settings jsonb default '{}'::jsonb,
  add column if not exists updated_at timestamp with time zone;

-- Ensure the onboarding flag exists (in case your table predates it)
alter table public.profiles
  add column if not exists onboarding_completed boolean default false;
```

## 3. Get API Keys
Go to **Project Settings -> API**.
Copy the `Project URL` and `anon` public key.

## 4. Configure Environment
Create a file named `.env.local` in your project root (if it doesn't exist) and add:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```
