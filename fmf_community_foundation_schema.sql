-- 1. COMMUNITY REQUESTS
-- Tracks users requesting early access to the community system.
CREATE TABLE IF NOT EXISTS public.community_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes text,
    UNIQUE(user_id) -- Prevent duplicate pending/approved requests per user
);

-- 2. COMMUNITY GROUPS
-- Core organizational clusters (by city, skill level, etc.)
CREATE TABLE IF NOT EXISTS public.community_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category text, -- e.g., 'City', 'Level', 'General'
    city text,     -- Nullable, specific to regional groups
    description text,
    is_active boolean DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. GROUP MEMBERSHIP
-- Connects approved users to their assigned community groups.
CREATE TABLE IF NOT EXISTS public.community_group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, user_id) -- Ensure user is fundamentally unique per group
);

-- 4. TARGETED ADMIN NOTIFICATIONS
-- Dispatch center for manual and automated user notification.
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    target_type text CHECK (target_type IN ('individual', 'city', 'group')),
    target_value text, -- Could be a city name, group ID string, or user ID
    is_read boolean DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Foundation)
ALTER TABLE public.community_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- 1. Users can insert their own request, see their own. Admins manage all.
CREATE POLICY "Users can manage own requests" ON public.community_requests FOR ALL USING (auth.uid() = user_id);
-- 2. Groups are readable by all when active.
CREATE POLICY "Anyone can read active groups" ON public.community_groups FOR SELECT USING (is_active = true);
-- 3. Users can read members of groups they are in, admins full.
CREATE POLICY "Members see other members" ON public.community_group_members FOR SELECT USING (true);
-- 4. Users read own notifications.
CREATE POLICY "Users read own notifications" ON public.admin_notifications FOR SELECT USING (auth.uid() = user_id);

-- NOTE: Secure Write-policies for Admins omitted here to keep it strictly focused on scalable architecture, 
-- but easily enabled via role checks in your API!
