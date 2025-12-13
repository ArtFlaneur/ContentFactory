# Fix Generation Count Issues

To ensure the generation count updates correctly and securely, please run this SQL script in your Supabase Dashboard -> SQL Editor.

This creates a secure function (RPC) that allows the application to increment the counter without complex permission checks, and ensures it works even if multiple updates happen at once.

```sql
-- 1. Create a secure function to increment generation count (supports custom amount)
create or replace function increment_generation_count(row_id uuid, amount int default 1)
returns void
language plpgsql
security definer
as $$
begin
  update profiles
  set generation_count = coalesce(generation_count, 0) + amount
  where id = row_id;
end;
$$;

-- 2. Ensure the profiles table has the correct permissions
alter table profiles enable row level security;

-- 3. Allow users to update their own profile (Drop first to avoid "already exists" error)
drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- 4. Allow users to view their own profile (Drop first to avoid "already exists" error)
drop policy if exists "Users can view own profile." on profiles;
create policy "Users can view own profile." on profiles
  for select using (auth.uid() = id);
```

## Why was the count resetting?

The issue where "3 trial generations are restored" happened because:
1. You generated posts as a "Guest" (saved in your browser).
2. When you signed in, the app loaded your "User" profile from the database (which had 0 generations).
3. The app overwrote your local "Guest" count with the "User" count (0).

**I have fixed this in the code!** Now, when you sign in, any generations you made as a guest will be automatically added to your account balance.
