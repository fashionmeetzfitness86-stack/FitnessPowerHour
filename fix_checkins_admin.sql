-- ============================================================
--  FMF Check-Ins Admin Fix
--  Problem: Admin dashboard shows 0 sessions because:
--    1. RLS on calendar_sessions blocks admin from reading all rows
--    2. workout_logs may have same issue
--  Solution: Add explicit admin SELECT policies for both tables
-- ============================================================

-- ─────────────────────────────────────────────────────────────
--  calendar_sessions — grant admins full read access
-- ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Admins view all sessions" ON public.calendar_sessions;
CREATE POLICY "Admins view all sessions"
  ON public.calendar_sessions FOR SELECT
  USING (
    auth.uid() = user_id
    OR assigned_provider_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─────────────────────────────────────────────────────────────
--  workout_logs — ensure admin can read all rows
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own workout logs"    ON public.workout_logs;
DROP POLICY IF EXISTS "Users insert own workout logs"  ON public.workout_logs;
DROP POLICY IF EXISTS "Admins view all workout logs"   ON public.workout_logs;

CREATE POLICY "Users view own workout logs"
  ON public.workout_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own workout logs"
  ON public.workout_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all workout logs"
  ON public.workout_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ─────────────────────────────────────────────────────────────
--  Ensure check_in_image column exists on calendar_sessions
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.calendar_sessions ADD COLUMN check_in_image TEXT;
  EXCEPTION WHEN duplicate_column THEN
    -- already exists, skip
  END;
END $$;

-- ─────────────────────────────────────────────────────────────
--  Verify: run this to confirm data exists
-- ─────────────────────────────────────────────────────────────
-- SELECT cs.id, cs.user_id, cs.source_type, cs.session_date, p.full_name, p.email
-- FROM public.calendar_sessions cs
-- LEFT JOIN public.profiles p ON p.id = cs.user_id
-- WHERE cs.source_type = 'check_in'
-- ORDER BY cs.created_at DESC
-- LIMIT 20;
