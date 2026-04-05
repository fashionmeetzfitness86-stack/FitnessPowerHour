-- Run this in your Supabase SQL Editor
-- This resolves the "Could not find the table 'public.site_content' in the schema cache" PGRST205 error that appeared in the console.

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Basic setup for site content
alter table public.site_content enable row level security;

-- Everyone can read site content
create policy "Anyone can read site content"
  on public.site_content for select
  using (true);

-- Only super admins can update
create policy "Super Admin can manage site content"
  on public.site_content for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
