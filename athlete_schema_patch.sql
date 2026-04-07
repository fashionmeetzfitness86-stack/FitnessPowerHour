-- Table: athlete_profiles
CREATE TABLE IF NOT EXISTS public.athlete_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_style TEXT,
    eating_schedule TEXT,
    preferred_body_type TEXT,
    fitness_philosophy TEXT,
    specialty TEXT,
    short_description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: trainer_requests
CREATE TABLE IF NOT EXISTS public.trainer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);
