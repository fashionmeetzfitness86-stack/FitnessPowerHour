DROP TABLE IF EXISTS public.athlete_applications CASCADE;

CREATE TABLE public.athlete_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    city VARCHAR(100),
    country VARCHAR(100),
    specialty VARCHAR(100) NOT NULL,
    years_experience INTEGER NOT NULL,
    certifications TEXT,
    short_bio TEXT NOT NULL,
    training_philosophy TEXT,
    workout_style VARCHAR(255),
    why_fmf TEXT NOT NULL,
    instagram VARCHAR(255),
    youtube VARCHAR(255),
    website VARCHAR(255),
    profile_photo_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.athlete_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit an application
CREATE POLICY "Allow public insert to applications" 
ON public.athlete_applications FOR INSERT 
WITH CHECK (true);

-- Allow admins to see and manage all applications
CREATE POLICY "Admins can read athlete applications" 
ON public.athlete_applications FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Admins can update applications" 
ON public.athlete_applications FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "Admins can delete applications" 
ON public.athlete_applications FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
