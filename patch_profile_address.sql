-- Add Address field to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
