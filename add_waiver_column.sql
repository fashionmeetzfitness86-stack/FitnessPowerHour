-- Add waiver_accepted to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS waiver_accepted BOOLEAN DEFAULT false;
