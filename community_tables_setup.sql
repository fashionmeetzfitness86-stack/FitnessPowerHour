-- ============================================================
--  FMF Community Tables Migration
--  Creates: community_whitelist, community_requests
-- ============================================================

-- ─────────────────────────────────────────
--  1. community_whitelist
--     Used by CommunityPage "Join Early Access" button
--     and the Admin Dashboard Whitelist tab.
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_whitelist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source      TEXT NOT NULL DEFAULT 'guest'  CHECK (source IN ('member', 'guest')),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_whitelist_email   ON public.community_whitelist (email);
CREATE INDEX IF NOT EXISTS idx_community_whitelist_user_id ON public.community_whitelist (user_id);
CREATE INDEX IF NOT EXISTS idx_community_whitelist_status  ON public.community_whitelist (status);

-- RLS
ALTER TABLE public.community_whitelist ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (guest + member sign-ups)
CREATE POLICY "community_whitelist_insert_any"
  ON public.community_whitelist FOR INSERT
  WITH CHECK (true);

-- Users can read their own row
CREATE POLICY "community_whitelist_select_own"
  ON public.community_whitelist FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all rows (service-role key bypasses RLS, but add
-- an explicit policy so the Admin Dashboard anon client works too)
CREATE POLICY "community_whitelist_select_admin"
  ON public.community_whitelist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update status
CREATE POLICY "community_whitelist_update_admin"
  ON public.community_whitelist FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ─────────────────────────────────────────
--  2. community_requests
--     Used by CommunityAccessTab (profile) and CommunityDetail
--     (per-community join requests) and CommunityManager (admin).
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_requests (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- optional: linked to a specific community hub (CommunityDetail flow)
  community_id         UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name_snapshot   TEXT,
  user_email_snapshot  TEXT,
  status               TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes                TEXT,
  requested_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_requests_user_id      ON public.community_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_community_requests_community_id ON public.community_requests (community_id);
CREATE INDEX IF NOT EXISTS idx_community_requests_status       ON public.community_requests (status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_community_requests_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_community_requests_updated_at ON public.community_requests;
CREATE TRIGGER trg_community_requests_updated_at
  BEFORE UPDATE ON public.community_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_community_requests_updated_at();

-- RLS
ALTER TABLE public.community_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own requests
CREATE POLICY "community_requests_insert_own"
  ON public.community_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own requests
CREATE POLICY "community_requests_select_own"
  ON public.community_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own request notes
CREATE POLICY "community_requests_update_own"
  ON public.community_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can read all requests
CREATE POLICY "community_requests_select_admin"
  ON public.community_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update status
CREATE POLICY "community_requests_update_admin"
  ON public.community_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
