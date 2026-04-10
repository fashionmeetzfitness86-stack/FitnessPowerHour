-- ============================================================
-- PATCH: Decouple athlete_profiles from profiles FK constraint
-- so admins can create athlete roster entries without requiring
-- a matching auth user / profiles row.
--
-- Run this ONCE in Supabase SQL Editor → New Query → Run
-- ============================================================

-- 1. Add missing columns if they don't exist
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS is_active     BOOLEAN DEFAULT true;
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS social_links  JSONB   DEFAULT '{}';
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS images        TEXT[]  DEFAULT '{}';
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ DEFAULT now();

-- 2. Drop the FK constraint that ties id → profiles(id)
--    (allows standalone athlete roster entries)
ALTER TABLE public.athlete_profiles
  DROP CONSTRAINT IF EXISTS athlete_profiles_id_fkey;

-- 3. Change id default to auto-generate UUIDs if no value is supplied
ALTER TABLE public.athlete_profiles
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';
