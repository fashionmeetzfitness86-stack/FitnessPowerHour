-- calendar_system_setup.sql
-- Use this in your Supabase SQL Editor

-- 1. Service Requests Table
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL, -- flex_mob, personal_training
    service_subtype VARCHAR(50) NOT NULL, -- massage, stretching, recovery, training_session, training_monthly
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, cancelled, completed
    assigned_provider_user_id UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Unified Calendar Sessions Table
-- (If it already exists, this ensures it exists with the required columns)
CREATE TABLE IF NOT EXISTS public.calendar_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL, -- workout, service, training, manual
    related_service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    related_program_assignment_id UUID REFERENCES public.user_program_assignments(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL,
    session_time TIME,
    duration_minutes INTEGER DEFAULT 60,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, completed, missed, cancelled
    assigned_provider_user_id UUID REFERENCES public.profiles(id),
    created_by_user_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- We can run some soft alters just in case it already existed without these fields
DO $$ 
BEGIN
    BEGIN ALTER TABLE public.calendar_sessions ADD COLUMN source_type VARCHAR(50) DEFAULT 'manual'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.calendar_sessions ADD COLUMN related_service_request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.calendar_sessions ADD COLUMN related_program_assignment_id UUID REFERENCES public.user_program_assignments(id); EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.calendar_sessions ADD COLUMN session_date DATE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.calendar_sessions ADD COLUMN session_time TIME; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.calendar_sessions ADD COLUMN duration_minutes INTEGER DEFAULT 60; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.calendar_sessions ADD COLUMN assigned_provider_user_id UUID REFERENCES public.profiles(id); EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.calendar_sessions ADD COLUMN created_by_user_id UUID REFERENCES public.profiles(id); EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- Update potentially old 'date' or 'time' columns to the new strictly named ones if needed by frontends, but 'date' usually existed.
-- Let's just assume we will read/write using these explicit fields or standard ones.

-- 3. Service Availability Engine
CREATE TABLE IF NOT EXISTS public.service_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_type VARCHAR(50) NOT NULL, -- global, flex_mob, personal_training
    provider_user_id UUID REFERENCES public.profiles(id), -- NULL means global availability
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- available, blocked, full
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Security Rules (RLS)
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_availability ENABLE ROW LEVEL SECURITY;

-- service_requests: Users can insert, view, edit own. Admins/providers can view/edit all.
CREATE POLICY "Users read own requests" ON public.service_requests FOR SELECT USING (user_id = auth.uid() OR assigned_provider_user_id = auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users inset own requests" ON public.service_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own requests" ON public.service_requests FOR UPDATE USING (user_id = auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'athlete')));

-- calendar_sessions: Unified 
CREATE POLICY "Users view own sessions" ON public.calendar_sessions FOR SELECT USING (user_id = auth.uid() OR assigned_provider_user_id = auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'athlete')));
CREATE POLICY "Users insert own sessions" ON public.calendar_sessions FOR INSERT WITH CHECK (user_id = auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'athlete')));
CREATE POLICY "Users update own sessions" ON public.calendar_sessions FOR UPDATE USING (user_id = auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'athlete')));
CREATE POLICY "Users delete own sessions" ON public.calendar_sessions FOR DELETE USING (user_id = auth.uid() OR EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- service_availability: Public can read, Admins/athletes can write
CREATE POLICY "Public reads availability" ON public.service_availability FOR SELECT USING (true);
CREATE POLICY "Admins control availability" ON public.service_availability FOR ALL USING (EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'athlete')));
