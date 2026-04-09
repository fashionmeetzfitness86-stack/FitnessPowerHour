-- ============================================================
-- FMF MEMBERSHIP ACCESS CONTROL — RLS POLICIES
-- Run this in your Supabase SQL Editor
-- Controls what authenticated users can read based on tier
-- ============================================================

-- ── HELPER: is_member() ────────────────────────────────────
-- Returns true if the current auth user has an active paid membership
CREATE OR REPLACE FUNCTION public.is_member()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (
        tier = 'Basic'
        OR role IN ('admin', 'super_admin', 'athlete', 'flex_mob_admin')
        OR membership_status = 'active'
      )
  );
$$;

-- ── HELPER: is_admin() ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'flex_mob_admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_member() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;


-- ============================================================
-- VIDEOS TABLE — Member-gated content
-- ============================================================
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view free/non-premium videos
DROP POLICY IF EXISTS "Public can view free videos" ON public.videos;
CREATE POLICY "Public can view free videos" ON public.videos
  FOR SELECT USING (
    visibility_status = 'published'
    AND (
      is_premium = false
      OR is_premium IS NULL
      OR public.is_member()
    )
  );

-- Admins can do anything
DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos;
CREATE POLICY "Admins can manage videos" ON public.videos
  FOR ALL USING (public.is_admin());


-- ============================================================
-- PROFILES TABLE — Everyone sees their own, admins see all
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- Allow service role full access (needed for webhook to update tier)
DROP POLICY IF EXISTS "Service role full access to profiles" ON public.profiles;
CREATE POLICY "Service role full access to profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role');


-- ============================================================
-- USER_MEMBERSHIPS TABLE
-- ============================================================
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own membership" ON public.user_memberships;
CREATE POLICY "Users can view own membership" ON public.user_memberships
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Service role manages memberships" ON public.user_memberships;
CREATE POLICY "Service role manages memberships" ON public.user_memberships
  FOR ALL USING (auth.role() = 'service_role' OR public.is_admin());


-- ============================================================
-- CALENDAR_SESSIONS — members only, own data
-- ============================================================
ALTER TABLE public.calendar_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can manage own sessions" ON public.calendar_sessions;
CREATE POLICY "Members can manage own sessions" ON public.calendar_sessions
  FOR ALL USING (
    (auth.uid() = user_id AND public.is_member())
    OR public.is_admin()
  );


-- ============================================================
-- SERVICE_REQUESTS — members only
-- ============================================================
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can manage own service requests" ON public.service_requests;
CREATE POLICY "Members can manage own service requests" ON public.service_requests
  FOR ALL USING (
    (auth.uid() = user_id AND public.is_member())
    OR public.is_admin()
  );


-- ============================================================
-- PROGRAM_TEMPLATES — members can view, admins manage
-- ============================================================
ALTER TABLE public.program_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view programs" ON public.program_templates;
CREATE POLICY "Members can view programs" ON public.program_templates
  FOR SELECT USING (
    status = 'active'
    AND (public.is_member() OR public.is_admin())
  );

DROP POLICY IF EXISTS "Admins can manage programs" ON public.program_templates;
CREATE POLICY "Admins can manage programs" ON public.program_templates
  FOR ALL USING (public.is_admin());


-- ============================================================
-- USER_PROGRAM_ASSIGNMENTS — member own data
-- ============================================================
ALTER TABLE public.user_program_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view own assignments" ON public.user_program_assignments;
CREATE POLICY "Members can view own assignments" ON public.user_program_assignments
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage assignments" ON public.user_program_assignments;
CREATE POLICY "Admins manage assignments" ON public.user_program_assignments
  FOR ALL USING (public.is_admin());


-- ============================================================
-- NOTIFICATIONS — own data only
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR public.is_admin());


-- ============================================================
-- RETREATS — published retreats public, member content gated
-- ============================================================
ALTER TABLE public.retreats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published retreats" ON public.retreats;
CREATE POLICY "Public can view published retreats" ON public.retreats
  FOR SELECT USING (
    visibility_status = 'published'
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins manage retreats" ON public.retreats;
CREATE POLICY "Admins manage retreats" ON public.retreats
  FOR ALL USING (public.is_admin());


-- ============================================================
-- POSTS (community) — members can access
-- ============================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view posts" ON public.posts;
CREATE POLICY "Members can view posts" ON public.posts
  FOR SELECT USING (public.is_member() OR public.is_admin());

DROP POLICY IF EXISTS "Members can insert posts" ON public.posts;
CREATE POLICY "Members can insert posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_member());

DROP POLICY IF EXISTS "Users can edit own posts" ON public.posts;
CREATE POLICY "Users can edit own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());


-- ============================================================
-- ENABLE REALTIME FOR PROFILES (webhook → instant UI update)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_memberships;


-- ============================================================
-- RELOAD SCHEMA CACHE
-- ============================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- DONE. All member access gates are now enforced at the DB level.
-- ============================================================
