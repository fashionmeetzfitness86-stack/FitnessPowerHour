-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Profiles table (replaces users table to avoid name collision with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin', 'super_admin', 'athlete', 'flex_mob_admin')),
  tier text not null default 'Free Access',
  status text not null default 'active' check (status in ('active', 'suspended', 'banned', 'archived')),
  signup_date timestamptz not null default now(),
  "joinedAt" text, -- Keeping legacy field for backward compatibility if needed during transition
  favorites text[] default '{}',
  streak integer default 0,
  "workoutLogs" jsonb default '[]',
  "personalBests" jsonb default '[]',
  "orderHistory" jsonb default '[]',
  profile_image text,
  profile_images text[] default '{}',
  bio text,
  short_bio text,
  phone text,
  city text,
  country text,
  date_of_birth date,
  age integer,
  height text,
  weight text,
  workout_style text,
  training_goals text,
  fitness_level text default 'Intermediate',
  limitations_or_injuries text,
  motivation text,
  onboarding_completed boolean default false,
  updated_at timestamptz not null default now()
);

-- Activity Logs table for Audit Trail
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  from_user_id text,
  from_user_name text,
  post_id text,
  post_content text,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

-- Indexes for performance
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
create index if not exists idx_activity_logs_actor_id on public.activity_logs(actor_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

-- RLS Policies for profiles table
create policy "Users can read all profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Super Admin can manage everything"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- RLS Policies for activity_logs table
create policy "Super Admin can read all logs"
  on public.activity_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

create policy "Authenticated users can insert logs"
  on public.activity_logs for insert
  with check (auth.role() = 'authenticated');

-- RLS Policies for notifications table
create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Authenticated users can create notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Trigger to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Enable realtime
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.notifications;
