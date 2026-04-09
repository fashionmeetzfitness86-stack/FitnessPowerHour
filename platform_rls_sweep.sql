-- PLATFORM RLS SECURITY SWEEP

-- 1. POSTS TABLE (Internal Feed)
-- Users should only be able to see posts if they are public OR if they belong to a community they are part of.
-- Note: Our existing "posts" table is flat, meaning it doesn't currently link to community_members.
-- Since the user specified "any user-owned content", let's ensure nobody can edit or delete someone else's post.
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert posts" ON public.posts;
CREATE POLICY "Users can insert posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can edit own posts" ON public.posts;
CREATE POLICY "Users can edit own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));


-- 2. ACTIVITY LOGS
-- Nobody should see another user's activity logs unless they are admin.
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_logs;
CREATE POLICY "Users can view own activity" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Users can insert own activity" ON public.activity_logs;
CREATE POLICY "Users can insert own activity" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 3. RETREAT APPLICATIONS
-- Users should only see their own retreat applications.
ALTER TABLE public.retreat_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own applications" ON public.retreat_applications;
CREATE POLICY "Users can view own applications" ON public.retreat_applications FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Users can insert own applications" ON public.retreat_applications;
CREATE POLICY "Users can insert own applications" ON public.retreat_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can update applications" ON public.retreat_applications;
CREATE POLICY "Admin can update applications" ON public.retreat_applications FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));


-- 4. SERVICE REQUESTS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own requests" ON public.service_requests;
CREATE POLICY "Users can view own requests" ON public.service_requests FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

DROP POLICY IF EXISTS "Users can insert own requests" ON public.service_requests;
CREATE POLICY "Users can insert own requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own requests" ON public.service_requests;
CREATE POLICY "Users can delete own requests" ON public.service_requests FOR DELETE USING (auth.uid() = user_id);
