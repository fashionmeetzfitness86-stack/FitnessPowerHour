-- ============================================================
-- FMF — Fix Retreat RLS so all users can see published retreats
-- and anyone can submit an application
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. RETREATS — allow anonymous + authenticated users to read published retreats
ALTER TABLE public.retreats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published retreats" ON public.retreats;
CREATE POLICY "Public can view published retreats"
  ON public.retreats FOR SELECT
  TO anon, authenticated
  USING (visibility_status = 'published');

DROP POLICY IF EXISTS "Admins manage retreats" ON public.retreats;
CREATE POLICY "Admins manage retreats"
  ON public.retreats FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
  );

-- 2. RETREAT APPLICATIONS — ensure the table exists with all needed columns
CREATE TABLE IF NOT EXISTS public.retreat_applications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retreat_id   UUID REFERENCES public.retreats(id) ON DELETE SET NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name    TEXT,
  user_email   TEXT NOT NULL,
  status       TEXT DEFAULT 'pending',
  admin_notes  TEXT,
  message      TEXT,
  phone        TEXT,
  amount_paid  NUMERIC DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Patch any missing columns (safe to re-run)
DO $$
BEGIN
  BEGIN ALTER TABLE public.retreat_applications ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreat_applications ADD COLUMN amount_paid NUMERIC DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreat_applications ADD COLUMN admin_notes TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreat_applications ADD COLUMN phone TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreat_applications ADD COLUMN status TEXT DEFAULT 'pending'; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreat_applications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- 3. RETREAT APPLICATIONS RLS
ALTER TABLE public.retreat_applications ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can submit an application
DROP POLICY IF EXISTS "Anyone can apply to a retreat" ON public.retreat_applications;
CREATE POLICY "Anyone can apply to a retreat"
  ON public.retreat_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can read their own applications
DROP POLICY IF EXISTS "Users can view own applications" ON public.retreat_applications;
CREATE POLICY "Users can view own applications"
  ON public.retreat_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read and update all applications
DROP POLICY IF EXISTS "Admins can manage all applications" ON public.retreat_applications;
CREATE POLICY "Admins can manage all applications"
  ON public.retreat_applications FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
  );

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';
