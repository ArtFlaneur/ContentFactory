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

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

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
