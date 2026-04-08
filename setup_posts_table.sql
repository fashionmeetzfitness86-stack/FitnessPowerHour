-- INITIALIZE POSTS TABLE FOR INTERNAL FEED
-- RUN IN SUPABASE SQL EDITOR

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  is_internal BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 1. All authenticated users can read internal posts
CREATE POLICY "Authenticated users can read internal posts"
  ON public.posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. Users can insert their own posts
CREATE POLICY "Users can insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 3. Admins/Super Admins can manage all posts
CREATE POLICY "Admins can manage all posts"
  ON public.posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
