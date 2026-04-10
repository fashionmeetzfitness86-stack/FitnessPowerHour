-- ============================================================
-- PATCH: Add all missing profile columns to public.profiles
-- Run this in the Supabase SQL Editor → New Query → Run
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS limitations_or_injuries TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_level TEXT DEFAULT 'Intermediate';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS training_goals TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS workout_style TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS motivation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_images TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS short_bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;

-- Force PostgREST to reload its schema cache so the columns are immediately visible
NOTIFY pgrst, 'reload schema';
