-- community_whitelist table
-- Stores all emails submitted on the Community "Join Early Access" form

CREATE TABLE IF NOT EXISTS public.community_whitelist (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name        TEXT,
    email       TEXT NOT NULL,
    source      TEXT DEFAULT 'guest' CHECK (source IN ('guest', 'member')),
    status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique email constraint so the same person can't flood the list
CREATE UNIQUE INDEX IF NOT EXISTS community_whitelist_email_idx ON public.community_whitelist (email);

-- RLS
ALTER TABLE public.community_whitelist ENABLE ROW LEVEL SECURITY;

-- Admins (admin, super_admin, god) can read and update all entries
CREATE POLICY "Admins full access to whitelist"
ON public.community_whitelist FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'god')
    )
);

-- Anyone (even unauthenticated) can insert
CREATE POLICY "Anyone can join whitelist"
ON public.community_whitelist FOR INSERT
WITH CHECK (true);

-- Reload schema
NOTIFY pgrst, 'reload schema';
