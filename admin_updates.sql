-- FMF System Schema Patch for Athletes and Shop V2
-- Run this in your Supabase SQL Editor

-- 1. Ensure `visibility` column exists on products to handle Member/General logic
DO $$ 
BEGIN
    BEGIN ALTER TABLE public.products ADD COLUMN visibility VARCHAR(50) DEFAULT 'general'; EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- 2. Ensure extra athlete profile fields explicitly exist
DO $$ 
BEGIN
    BEGIN ALTER TABLE public.athlete_profiles ADD COLUMN is_active BOOLEAN DEFAULT true; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.athlete_profiles ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.athlete_profiles ADD COLUMN images JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- Notice: 'username', 'full_name', and 'profile_image' remain correctly managed on the 'profiles' base table.
