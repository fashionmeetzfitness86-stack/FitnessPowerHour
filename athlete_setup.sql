-- athlete_setup.sql
-- Execute this script in your Supabase SQL Editor.

-- 1. Create or Update athlete_applications table
CREATE TABLE IF NOT EXISTS public.athlete_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    bio TEXT,
    experience TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    videos JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create or Update athletes table (Ensure strict tracking linking exactly to the user)
CREATE TABLE IF NOT EXISTS public.athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    bio TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    videos JSONB DEFAULT '[]'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    training_style VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- active, inactive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS Enablement
ALTER TABLE public.athlete_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own athlete applications
CREATE POLICY "Users can create their own applications" 
ON public.athlete_applications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own application status
CREATE POLICY "Users can view own application" 
ON public.athlete_applications FOR SELECT 
USING (auth.uid() = user_id);

-- Allow admins to see and manage all applications
CREATE POLICY "Admins can manage athlete applications" 
ON public.athlete_applications FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Allow public read access to athletes (for public facing profiles)
CREATE POLICY "Public read access to athletes" 
ON public.athletes FOR SELECT USING (true);

-- Allow admins to manage athletes
CREATE POLICY "Admins can manage athletes" 
ON public.athletes FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Allow athletes to update their own profile info
CREATE POLICY "Athletes can update own profile" 
ON public.athletes FOR UPDATE 
USING (auth.uid() = user_id);
