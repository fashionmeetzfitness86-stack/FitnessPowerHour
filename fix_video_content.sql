-- ============================================================
-- PATCH: Fix Video Content section errors
-- Run ONCE in Supabase SQL Editor → New Query → Run
-- ============================================================

-- 1. Ensure video_categories table exists with default categories
CREATE TABLE IF NOT EXISTS public.video_categories (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT    NOT NULL,
  slug       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Insert default categories (only if table is empty)
INSERT INTO public.video_categories (name, slug)
SELECT name, slug FROM (VALUES
  ('Beginner',      'beginner'),
  ('Intermediate',  'intermediate'),
  ('Advanced',      'advanced'),
  ('Mobility',      'mobility'),
  ('Full Body',     'full-body'),
  ('Recovery',      'recovery'),
  ('Strength',      'strength'),
  ('Cardio',        'cardio')
) AS t(name, slug)
WHERE NOT EXISTS (SELECT 1 FROM public.video_categories LIMIT 1);

-- 3. Add created_by column on videos if missing
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS created_by UUID;

-- 4. Make sure RLS allows admins to select video_categories
ALTER TABLE public.video_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow select for all" ON public.video_categories
  FOR SELECT USING (true);

-- 5. Reload schema cache
NOTIFY pgrst, 'reload schema';
