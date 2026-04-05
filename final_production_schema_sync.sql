-- =========================================================================
-- FINAL PRODUCTION SCHEMA SYNC
-- =========================================================================
-- This script safely constructs all missing fields and tables for the live 
-- production environment without destroying any existing data.

-- 1. ADD MISSING PROFILE ONBOARDING COLUMNS
-- Adding required columns for the Onboarding and EditProfile components.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS fitness_level text,
  ADD COLUMN IF NOT EXISTS workout_style text,
  ADD COLUMN IF NOT EXISTS training_goals text,
  ADD COLUMN IF NOT EXISTS current_injuries text,
  ADD COLUMN IF NOT EXISTS pass_status text,
  ADD COLUMN IF NOT EXISTS pass_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS height text,
  ADD COLUMN IF NOT EXISTS weight text,
  ADD COLUMN IF NOT EXISTS birth_date text,
  ADD COLUMN IF NOT EXISTS target_weight text,
  ADD COLUMN IF NOT EXISTS medical_conditions text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS push_notifications boolean default true,
  ADD COLUMN IF NOT EXISTS email_notifications boolean default true,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean default false;

-- 2. CREATE MISSING SITE_CONTENT TABLE
-- Fixes the PGRST205 error where the frontend continuously searches for dynamic CMS data.

CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Enable RLS for site_content
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read the content without a login
CREATE POLICY IF NOT EXISTS "Anyone can read site content"
  ON public.site_content FOR SELECT
  USING (true);

-- Allow only super admins to modify the content
CREATE POLICY IF NOT EXISTS "Super Admin can manage site content"
  ON public.site_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 3. RELOAD POSTGREST CACHE
-- Notify Supabase's API engine to flush the cache so the frontend can immediately see the new columns and tables.
NOTIFY pgrst, 'reload schema';
