-- Fashion Meetz Fitness (FMF) Database Initialization & Extension
-- Execute this script in your Supabase SQL Editor to fill missing infrastructure

-- 1. Passes & QR Validation System
CREATE TABLE IF NOT EXISTS public.passes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pass_type text NOT NULL, -- e.g., '3-Day Local Pass', '7-Day Local Pass', 'Physical Local Pass'
  token text UNIQUE NOT NULL, -- encrypted hash or unique alphanumeric string for QR code
  qr_code_url text, -- optional if using dynamic generation
  status text DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'expired', 'revoked')),
  expires_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and setup policies for passes
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own passes" ON public.passes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view and update all passes" ON public.passes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- 2. Retreat Deposits & Progress Tracking
CREATE TABLE IF NOT EXISTS public.retreat_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  retreat_id UUID REFERENCES public.retreats(id) ON DELETE CASCADE,
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'approved_pending_deposit', 'deposit_paid', 'confirmed', 'rejected')),
  stripe_session_id text, -- holds the deposit checkout session id
  amount_paid NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.retreat_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own requests" ON public.retreat_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own requests" ON public.retreat_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage retreat requests" ON public.retreat_requests FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- 3. Community Foundation Tables
CREATE TABLE IF NOT EXISTS public.community_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.community_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  image_url text,
  access_type text DEFAULT 'public' CHECK (access_type IN ('public', 'private', 'package_required', 'invite_only')),
  required_package text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  status text DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'banned')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(community_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  image_url text,
  status text DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived', 'flagged')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Community
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Allow read access for public stuff, admin write.
-- Communities should be readable by all, but posts might be restricted to members.
CREATE POLICY "Public read community categories" ON public.community_categories FOR SELECT USING (true);
CREATE POLICY "Public read communities" ON public.communities FOR SELECT USING (status = 'active');
CREATE POLICY "Public read members" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Members read posts" ON public.community_posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.community_members WHERE community_id = public.community_posts.community_id AND user_id = auth.uid() AND status = 'approved')
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Members read comments" ON public.community_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.community_posts p JOIN public.community_members m ON p.community_id = m.community_id WHERE p.id = post_id AND m.user_id = auth.uid() AND m.status = 'approved')
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Note: In a true prod env, insert default categories like 'Miami Beach', 'New York' here:
INSERT INTO public.community_categories (name, description) VALUES
('Miami Beach', 'Sun, surf, and local running clubs.'),
('Miami Dade County', 'Greater Miami wellness collectives.'),
('New York', 'Urban athletes and Central Park squads.'),
('France', 'CLÉ Paris community and retreats.'),
('UK', 'London wellness and training hub.'),
('California', 'West coast fitness collectives.')
ON CONFLICT DO NOTHING;

-- 4. Advanced Tracking Gate Schema helper
-- We rely on profiles.tier or packages table. We can enforce it strictly using policies or application logic.
-- Since progress tracking images already write to user_video_uploads with media_type='photo', we'll rely on our existing application tier logic.

-- Execute complete.
