-- ============================================================
-- PRODUCTS TABLE — Add missing columns for Shop Manager
-- Run in Supabase SQL Editor
-- ============================================================

-- Add visibility column (general / members)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'general'
    CHECK (visibility IN ('general', 'members'));

-- Add is_recommended flag
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN NOT NULL DEFAULT false;

-- Add sizes array (e.g. ['S','M','L','XL'])
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sizes TEXT[] NOT NULL DEFAULT '{}';

-- Add gender field
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gender TEXT
    CHECK (gender IN ('Men', 'Women', 'Both') OR gender IS NULL);

-- inventory_count already exists in most schemas, but ensure it's there
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS inventory_count INTEGER NOT NULL DEFAULT 0;

-- Ensure status column exists (active / draft)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'draft', 'archived'));

-- Ensure category column exists as text fallback (some schemas use category_id TEXT)
-- If your DB uses category_id as a FK, you may already have this — safe to run
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_id TEXT;

-- Ensure featured_image exists
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- ── RLS: Allow admins to manage products ───────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (
    status = 'active'
    AND (
      visibility = 'general'
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND (tier = 'Basic' OR role IN ('admin', 'super_admin', 'athlete'))
      )
    )
  );

-- Service role bypasses RLS (needed for API/webhook writes)
DROP POLICY IF EXISTS "Service role full access to products" ON public.products;
CREATE POLICY "Service role full access to products" ON public.products
  FOR ALL USING (auth.role() = 'service_role');

-- ── Reload schema cache ────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- DONE. Products table is now ready for ShopManager.
-- ============================================================
