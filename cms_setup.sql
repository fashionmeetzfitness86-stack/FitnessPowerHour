-- cms_setup.sql
-- Execute this file directly in the Supabase SQL Editor.

-- Create the site_content table for global CMS functionality
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'text', -- 'text', 'image_url', 'link'
    description TEXT,
    last_updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site_content so the frontend can load the text instantly
CREATE POLICY "Public read access to site_content" 
ON public.site_content FOR SELECT 
USING (true);

-- Allow Admins and Super Admins to manage site content
CREATE POLICY "Admins can manage site_content" 
ON public.site_content FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    )
);

-- Insert Initial Default Template Data for the Homepage
INSERT INTO public.site_content (key, value, type, description) VALUES
('home_hero_title', 'Own Your Power', 'text', 'Main massive title on the homepage hero section.'),
('home_hero_subtitle', 'The ultimate membership-based accountability platform.', 'text', 'Subtitle under the hero title.'),
('home_hero_bg_image', 'https://picsum.photos/seed/fmf-hero/1920/1080', 'image_url', 'Background image for the hero section.'),
('home_membership_price', '19.99', 'text', 'The monthly cost of the Basic Membership.'),
('home_retreats_description', 'Step fully off the grid. Immerse yourself in a guided physical and mental overhaul at our exclusive global destinations.', 'text', 'Description text block for Retreats section.')
ON CONFLICT (key) DO NOTHING;
