-- ============================================================
-- FMF STRIPE BILLING SYNC — SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── 1. Add Stripe billing columns to profiles ──────────────
DO $$ BEGIN
  BEGIN ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN stripe_subscription_id TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN payment_method_brand TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.profiles ADD COLUMN payment_method_last4 TEXT; EXCEPTION WHEN duplicate_column THEN END;
  -- membership_status separates Stripe billing state from role/access status
  BEGIN ALTER TABLE public.profiles ADD COLUMN membership_status TEXT DEFAULT 'inactive'; EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- ── 2. Add Stripe billing columns to user_memberships ──────
DO $$ BEGIN
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN stripe_customer_id TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN stripe_subscription_id TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN payment_method_brand TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN payment_method_last4 TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN payment_method_exp_month INTEGER; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.user_memberships ADD COLUMN payment_method_exp_year INTEGER; EXCEPTION WHEN duplicate_column THEN END;
  -- Make package_id optional (might not exist yet when webhook fires)
  BEGIN ALTER TABLE public.user_memberships ALTER COLUMN package_id DROP NOT NULL; EXCEPTION WHEN others THEN END;
END $$;

-- ── 3. Index for fast Stripe customer lookups ──────────────
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_stripe_customer_id ON public.user_memberships(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_stripe_subscription_id ON public.user_memberships(stripe_subscription_id);

-- ── 4. Ensure user_memberships table exists (safe) ─────────
-- (This is idempotent — only creates if absent)
CREATE TABLE IF NOT EXISTS public.user_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  renews_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  auto_pay_enabled BOOLEAN DEFAULT TRUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  payment_method_brand TEXT,
  payment_method_last4 TEXT,
  payment_method_exp_month INTEGER,
  payment_method_exp_year INTEGER,
  last_changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. Ensure notifications table has needed columns ───────
DO $$ BEGIN
  BEGIN ALTER TABLE public.notifications ADD COLUMN type TEXT DEFAULT 'general'; EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- ── 6. Reload PostgREST schema cache ───────────────────────
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- DONE. All Stripe billing sync columns are now in place.
-- ============================================================
