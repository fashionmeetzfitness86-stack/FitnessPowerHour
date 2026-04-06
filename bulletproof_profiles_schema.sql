-- =========================================================================
-- BULLETPROOF PROFILES SCHEMA ALIGNMENT
-- =========================================================================
-- This script ensures EVERY single field tracked by the frontend React Application
-- exists on the Supabase database. It safely skips anything that already exists.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS auth_user_id text,
  ADD COLUMN IF NOT EXISTS age int,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS date_of_birth text,
  ADD COLUMN IF NOT EXISTS profile_image text,
  ADD COLUMN IF NOT EXISTS package_id text,
  ADD COLUMN IF NOT EXISTS tier text default 'Basic',
  ADD COLUMN IF NOT EXISTS membership_package_id text,
  ADD COLUMN IF NOT EXISTS membership_status text,
  ADD COLUMN IF NOT EXISTS last_membership_change_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text default 'active',
  ADD COLUMN IF NOT EXISTS banned_at timestamptz,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS profile_images text[],
  ADD COLUMN IF NOT EXISTS is_auto_pay boolean,
  ADD COLUMN IF NOT EXISTS payment_method_id text,
  ADD COLUMN IF NOT EXISTS last_billing_update timestamptz,
  ADD COLUMN IF NOT EXISTS favorites text[],
  ADD COLUMN IF NOT EXISTS streak_count int,
  ADD COLUMN IF NOT EXISTS last_checkin timestamptz,
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS last_tier_change_date timestamptz,
  ADD COLUMN IF NOT EXISTS preferred_workout_days text[],
  ADD COLUMN IF NOT EXISTS preferred_workout_time text,
  ADD COLUMN IF NOT EXISTS favorite_training_focus text,
  ADD COLUMN IF NOT EXISTS limitations_or_injuries text,
  ADD COLUMN IF NOT EXISTS short_bio text,
  ADD COLUMN IF NOT EXISTS motivation text,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS streak int;

-- Force the API engine to re-scan the entire table layout
NOTIFY pgrst, 'reload schema';
