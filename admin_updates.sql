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
  
-- 3. Ensure bookmark, favorite, and settings columns exist on profiles  
DO $$
BEGIN  
    BEGIN ALTER TABLE public.profiles ADD COLUMN bookmarks JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;  
    BEGIN ALTER TABLE public.profiles ADD COLUMN favorites JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;  
    BEGIN ALTER TABLE public.profiles ADD COLUMN last_checkin TEXT; EXCEPTION WHEN duplicate_column THEN END;  
    BEGIN ALTER TABLE public.profiles ADD COLUMN streak_count INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;  
    BEGIN ALTER TABLE public.profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"billing_reminders":true,"payment_confirmations":true,"membership_renewals":true,"workout_reminders":false,"retreat_confirmations":true,"program_updates":true,"order_updates":true}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;  
END $$; 
