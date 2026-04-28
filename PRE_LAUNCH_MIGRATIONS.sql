-- ============================================================
-- FMF PRE-LAUNCH SQL MIGRATION BUNDLE
-- Run each block IN ORDER in Supabase SQL Editor.
-- Each block is idempotent (safe to run multiple times).
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- BLOCK 1 OF 3: PROFILE SCHEMA PATCH
-- Source: fix_production_errors.sql
-- Adds all missing profile columns + Stripe indexes
-- ─────────────────────────────────────────────────────────────

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
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT; EXCEPTION WHEN duplicate_column THEN END;

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
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bookmarks TEXT[] DEFAULT '{}'; EXCEPTION WHEN duplicate_column THEN END;

  -- ── STRIPE BILLING ─────────────────────────────────────────
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_method_brand TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_method_last4 TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'inactive'; EXCEPTION WHEN duplicate_column THEN END;

  -- ── NOTIFICATION PREFERENCES ───────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_stripe_customer ON public.user_memberships(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_stripe_sub ON public.user_memberships(stripe_subscription_id);

NOTIFY pgrst, 'reload schema';

-- ✅ BLOCK 1 DONE


-- ─────────────────────────────────────────────────────────────
-- BLOCK 2 OF 3: NOTIFICATIONS TABLE + ADMIN BROADCAST LOG
-- Source: community_notifications_schema.sql + fmf_admin_broadcast_schema.sql
-- ─────────────────────────────────────────────────────────────

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL,
    title text,
    message text,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns to existing notifications table (if it already existed without them)
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS message TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can insert notifications for any user
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Create admin broadcast log table
CREATE TABLE IF NOT EXISTS public.admin_broadcast_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  recipient_value TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'sent',
  sent_count INTEGER DEFAULT 0,
  repeat_interval TEXT DEFAULT 'none',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_broadcast_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admins can manage broadcast logs" ON public.admin_broadcast_log;
CREATE POLICY "Super Admins can manage broadcast logs"
  ON public.admin_broadcast_log FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin' OR role = 'admin')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin' OR role = 'admin')
  );

NOTIFY pgrst, 'reload schema';

-- ✅ BLOCK 2 DONE


-- ─────────────────────────────────────────────────────────────
-- BLOCK 3 OF 3: POSTS TABLE
-- Source: setup_posts_table.sql
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  is_internal BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read posts
DROP POLICY IF EXISTS "Authenticated users can read internal posts" ON public.posts;
CREATE POLICY "Authenticated users can read internal posts"
  ON public.posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can insert their own posts
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
CREATE POLICY "Users can insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Admins can manage all posts
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.posts;
CREATE POLICY "Admins can manage all posts"
  ON public.posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

NOTIFY pgrst, 'reload schema';

-- ✅ BLOCK 3 DONE
-- ============================================================
-- ALL MIGRATIONS COMPLETE
-- ============================================================
