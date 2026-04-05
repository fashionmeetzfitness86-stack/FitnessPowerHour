-- program_system_setup.sql
-- Run this in your Supabase SQL Editor

-- 1. Program Templates
CREATE TABLE IF NOT EXISTS public.program_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by_user_id UUID REFERENCES public.profiles(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    phase VARCHAR(50) NOT NULL, -- Phase 1, Phase 2, Phase 3
    difficulty VARCHAR(50) NOT NULL, -- beginner, intermediate, advanced
    category VARCHAR(100) NOT NULL, -- calisthenics, yoga, recovery, etc.
    duration_days INTEGER NOT NULL DEFAULT 30,
    sessions_per_week INTEGER DEFAULT 3,
    training_focus VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Program Template Videos (Mapping)
CREATE TABLE IF NOT EXISTS public.program_template_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_template_id UUID REFERENCES public.program_templates(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    day_number INTEGER,
    week_number INTEGER,
    instruction_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. User Program Assignments
CREATE TABLE IF NOT EXISTS public.user_program_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    program_template_id UUID REFERENCES public.program_templates(id) ON DELETE CASCADE,
    assigned_by_user_id UUID REFERENCES public.profiles(id),
    assigned_by_role VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE,
    custom_notes TEXT,
    completion_percent INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'assigned', -- assigned, active, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Program Assignment Notes (Coach Communication)
CREATE TABLE IF NOT EXISTS public.program_assignment_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_program_assignment_id UUID REFERENCES public.user_program_assignments(id) ON DELETE CASCADE,
    author_user_id UUID REFERENCES public.profiles(id),
    author_role VARCHAR(50),
    note_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.program_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_template_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_program_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_assignment_notes ENABLE ROW LEVEL SECURITY;

-- Allow public to read active templates (so users can be assigned them and view them)
CREATE POLICY "Public can view active templates" 
ON public.program_templates FOR SELECT USING (status != 'archived');

-- Allow admins and athletes to manage templates
CREATE POLICY "Admins and Athletes manage templates" 
ON public.program_templates FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'athlete')));

-- Template Videos Read
CREATE POLICY "Public read template videos" 
ON public.program_template_videos FOR SELECT USING (true);

-- Template Videos Manage
CREATE POLICY "Admins and Athletes manage template videos" 
ON public.program_template_videos FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'athlete')));

-- Assignments Read (Users can see their own, admins/athletes can see all)
CREATE POLICY "Users view own assignments" 
ON public.user_program_assignments FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'athlete')));

-- Assignments Manage (Admins/athletes can manage)
CREATE POLICY "Admins and Athletes assign programs" 
ON public.user_program_assignments FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'athlete')));

-- Users can update completion status (UPDATE only for their own assignments)
CREATE POLICY "Users update own assignment progress" 
ON public.user_program_assignments FOR UPDATE 
USING (auth.uid() = user_id);

-- Program Assignment Notes
CREATE POLICY "Users and admins view notes" 
ON public.program_assignment_notes FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_program_assignments WHERE id = user_program_assignment_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'athlete'))
);

CREATE POLICY "Admins and Athletes create notes" 
ON public.program_assignment_notes FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'athlete')));
