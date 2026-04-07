-- 🚨 RUN THIS IN SUPABASE SQL EDITOR TO FIX PRODUCTION ERRORS 🚨
-- This script ensures all missing profile columns and notification matrices are synchronized.

DO $$ 
BEGIN
    -- 1. FIX: Missing 'notification_preferences' (Resolves Dashboard Error)
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

    -- 2. Ensure extra metadata fields for programs and scheduling exist
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "height" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "weight" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "workout_style" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "training_goals" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "streak_count" INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "last_checkin" TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN END;

    -- 3. Ensure onboarding state is tracked
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "onboarding_completed" BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;

END $$;

-- 4. Reload Schema to ensure PostgREST picks up changes immediately
NOTIFY pgrst, 'reload schema';

-- 📝 NOTE ON STRIPE ERROR ("STRIPE NODE CONNECTION FAILED"):
-- This is caused by missing environment variables in your Netlify Dashboard. 
-- Please ensure the following variables are set in Netlify -> Site Configuration -> Environment Variables:
-- 1. STRIPE_API_KEY (Your Stripe Secret Key)
-- 2. SUPABASE_SERVICE_ROLE_KEY (Found in Supabase API Settings)
-- 3. VITE_SUPABASE_URL (Your Supabase Project URL)
