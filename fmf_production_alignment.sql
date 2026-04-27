-- ============================================================
-- FMF Platform — Production Alignment SQL Patch
-- Date: April 27, 2026
-- Purpose: Add missing columns identified in the full audit
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

-- ── 1. profiles — add streak tracking + last workout date ──────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_count    INTEGER     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_workout_date DATE       DEFAULT NULL;

COMMENT ON COLUMN public.profiles.streak_count      IS 'Current consecutive daily check-in streak';
COMMENT ON COLUMN public.profiles.last_workout_date IS 'Date of last logged workout or check-in';


-- ── 2. service_requests — add guest booking fields ─────────────────────────
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS guest_name     TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guest_email    TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS guest_phone    TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS amount_paid    NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS service_subtype TEXT       DEFAULT NULL;

COMMENT ON COLUMN public.service_requests.guest_name     IS 'Name for non-registered guest bookings';
COMMENT ON COLUMN public.service_requests.guest_email    IS 'Email for non-registered guest bookings';
COMMENT ON COLUMN public.service_requests.guest_phone    IS 'Phone for non-registered guest bookings';
COMMENT ON COLUMN public.service_requests.amount_paid    IS 'Amount paid at time of booking (0 if invoiced)';
COMMENT ON COLUMN public.service_requests.service_subtype IS 'Sub-category: massage, stretching, recovery, training_session, etc.';


-- ── 3. calendar_sessions — ensure notes/rating/check_in_image exist ────────
-- (These were already added in a prior migration — this is idempotent)
ALTER TABLE public.calendar_sessions
  ADD COLUMN IF NOT EXISTS notes           TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rating          INTEGER     CHECK (rating >= 1 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS check_in_image  TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();


-- ── 4. orders — ensure customer_name_snapshot exists ───────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name_snapshot TEXT DEFAULT NULL;

COMMENT ON COLUMN public.orders.customer_name_snapshot IS 'Snapshot of customer full name at time of order (for display if user is deleted)';


-- ── 5. retreats — ensure capacity and requirements exist ───────────────────
ALTER TABLE public.retreats
  ADD COLUMN IF NOT EXISTS capacity     INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS requirements TEXT    DEFAULT NULL;

COMMENT ON COLUMN public.retreats.capacity     IS 'Maximum number of participants';
COMMENT ON COLUMN public.retreats.requirements IS 'Prerequisites or requirements for participants';


-- ── 6. community_requests — ensure requested_at column exists ──────────────
-- CommunityManager orders by requested_at; created_at is the actual column name
-- This adds an alias via a generated column if needed, or we just ensure it exists
ALTER TABLE public.community_requests
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT NOW();


-- ── 7. RLS — service_requests: allow admin to see all rows ─────────────────
DROP POLICY IF EXISTS "Admins see all service requests" ON public.service_requests;
CREATE POLICY "Admins see all service requests"
  ON public.service_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'flex_mob_admin')
    )
  );

-- Users see only their own
DROP POLICY IF EXISTS "Users see own service requests" ON public.service_requests;
CREATE POLICY "Users see own service requests"
  ON public.service_requests
  FOR SELECT
  USING (user_id = auth.uid());


-- ── 8. RLS — orders: allow admin to see all orders ─────────────────────────
DROP POLICY IF EXISTS "Admins see all orders" ON public.orders;
CREATE POLICY "Admins see all orders"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );


-- ── Done ───────────────────────────────────────────────────────────────────
SELECT 'FMF Production Alignment Patch applied successfully ✅' AS result;
