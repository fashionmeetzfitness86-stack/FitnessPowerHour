-- Run this in your Supabase SQL Editor to add the bookmarks column to profiles

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bookmarks text[] DEFAULT '{}';

-- Info: We chose Option B (Extending the clean existing system) since 'favorites' is already 
-- beautifully established as a text array, and this keeps the state perfectly synced with 
-- your 'user' object in memory with zero extra table joins.
