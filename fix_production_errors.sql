-- 🚨 BULLETPROOF PRODUCTION SCHEMA SYNC 🚨
-- Run this in your Supabase SQL Editor to ensure ALL profile fields are synchronized.

DO $$ 
BEGIN
    -- Core Identity & Contact
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "full_name" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "phone" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "city" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "country" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "date_of_birth" DATE; EXCEPTION WHEN duplicate_column THEN END;
    
    -- Fitness & Physical Markers
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "height" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "weight" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "fitness_level" TEXT DEFAULT 'Intermediate'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "workout_style" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "training_goals" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "limitations_or_injuries" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "motivation" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "bio" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "short_bio" TEXT; EXCEPTION WHEN duplicate_column THEN END;

    -- System State & Gamification
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "onboarding_completed" BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "streak_count" INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "last_checkin" TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "tier" TEXT DEFAULT 'Basic'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "last_tier_change_date" TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN END;
    
    -- Media and Arrays
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "profile_images" TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "favorites" TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN END;

    -- Preference/Notification Matrix
    BEGIN 
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "notification_preferences" JSONB DEFAULT '{
            "billing_reminders": true,
            "payment_confirmations": true,
            "membership_renewals": true,
            "workout_reminders": false,
            "retreat_confirmations": true,
            "program_updates": true,
            "order_updates": true
        }'::jsonb;
    EXCEPTION WHEN duplicate_column THEN END;

END $$;

-- Reload Schema to ensure PostgREST picks up changes immediately
NOTIFY pgrst, 'reload schema';
