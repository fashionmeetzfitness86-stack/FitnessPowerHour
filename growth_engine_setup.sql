-- Phase 4: Growth Engine SQL Schema Setup
-- Run this in the Supabase SQL Editor

-- 1. Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, converted
    reward_given BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on RLS for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
    ON public.referrals FOR SELECT
    USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals"
    ON public.referrals FOR INSERT
    WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "Super Admins have full access to referrals"
    ON public.referrals FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
      )
    );

-- 2. Add columns to profiles for streaks and referrals
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='referral_code') THEN
        ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_checkin') THEN
        ALTER TABLE public.profiles ADD COLUMN last_checkin TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='streak_count') THEN
        ALTER TABLE public.profiles ADD COLUMN streak_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Create a Supabase function to generate a referral code on insert
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS trigger AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        -- Generate a simple 8-char alphanumeric code
        NEW.referral_code := substr(md5(random()::text), 1, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_referral_code ON public.profiles;
CREATE TRIGGER ensure_referral_code
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code();

-- Generate referral codes for existing users who don't have one
UPDATE public.profiles
SET referral_code = substr(md5(random()::text), 1, 8)
WHERE referral_code IS NULL;
