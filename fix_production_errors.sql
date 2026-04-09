-- ============================================================
-- FMF PROFILE SCHEMA PATCH — Run in Supabase SQL Editor
-- Fixes: "could not find column in schema cache" errors
-- ============================================================

DO $$
BEGIN
  -- ── PROFILE / KINETIC MARKERS ──────────────────────────────
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS limitations_or_injuries TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_level TEXT DEFAULT 'Intermediate'; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_training_focus TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS workout_style TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS training_goals TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_workout_days TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_workout_time TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_level TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS motivation TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS short_bio TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT; EXCEPTION WHEN duplicate_column THEN END;

  -- ── CONTACT & IDENTITY ─────────────────────────────────────
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT; EXCEPTION WHEN duplicate_column THEN END;

  -- ── GAMIFICATION & STATE ───────────────────────────────────
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_checkin TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Free'; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_tier_change_date TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT; EXCEPTION WHEN duplicate_column THEN END;

  -- ── MEDIA ──────────────────────────────────────────────────
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_images TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorites TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN END;

  -- ── STRIPE BILLING (added in April 2026) ───────────────────
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_method_brand TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_method_last4 TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'inactive'; EXCEPTION WHEN duplicate_column THEN END;

  -- ── NOTIFICATIONS PREFERENCES ──────────────────────────────
  BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
      "billing_reminders": true,
      "payment_confirmations": true,
      "membership_renewals": true,
      "workout_reminders": false,
      "retreat_confirmations": true,
      "program_updates": true,
      "order_updates": true
    }'::jsonb;
  EXCEPTION WHEN duplicate_column THEN END;

  -- ── USER MEMBERSHIPS (Stripe columns) ──────────────────────
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN IF NOT EXISTS payment_method_brand TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN IF NOT EXISTS payment_method_last4 TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN IF NOT EXISTS payment_method_exp_month INTEGER; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN IF NOT EXISTS payment_method_exp_year INTEGER; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.user_memberships ALTER COLUMN package_id DROP NOT NULL; EXCEPTION WHEN others THEN END;

END $$;

-- ── INDEXES FOR FAST STRIPE LOOKUPS ────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_stripe_customer ON public.user_memberships(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_stripe_sub ON public.user_memberships(stripe_subscription_id);

-- ── FORCE POSTGREST SCHEMA CACHE RELOAD ────────────────────
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- DONE. Run this once and all schema errors should clear.
-- ============================================================
