-- Add favorites and bookmarks to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS favorites text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS bookmarks text[] DEFAULT '{}'::text[];
