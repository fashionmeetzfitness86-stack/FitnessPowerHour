-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Users table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  tier text not null default 'Free Access',
  "joinedAt" text not null,
  favorites text[] default '{}',
  streak integer default 0,
  "workoutLogs" jsonb default '[]',
  "personalBests" jsonb default '[]',
  "orderHistory" jsonb default '[]'
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
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.notifications enable row level security;

-- RLS Policies for users table
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

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

-- Enable realtime for both tables
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.notifications;
