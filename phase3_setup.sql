CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS user_name_snapshot text;

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.community_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.community_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON public.community_post_likes FOR DELETE USING (auth.uid() = user_id);

-- LEGACY CLEANUP PLAN
-- Once satisfied that all comments and likes have migrated or are no longer needed from the JSON columns,
-- run the following block to fully deprecate the legacy fields.
-- 
-- ALTER TABLE public.community_posts DROP COLUMN IF EXISTS comments;
-- ALTER TABLE public.community_posts DROP COLUMN IF EXISTS likes;
