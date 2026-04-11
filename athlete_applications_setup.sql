-- ============================================================
-- FMF PLATFORM — Athlete Applications Table
-- Run this in the Supabase SQL Editor (FitnessPowerHour project)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.athlete_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  city            TEXT,
  country         TEXT,
  specialty       TEXT NOT NULL,
  years_experience INTEGER DEFAULT 0,
  certifications  TEXT,
  short_bio       TEXT NOT NULL,
  training_philosophy TEXT,
  workout_style   TEXT,
  why_fmf         TEXT NOT NULL,
  instagram       TEXT,
  youtube         TEXT,
  website         TEXT,
  profile_photo_url TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.athlete_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT (public application form)
CREATE POLICY "Public can submit athlete applications"
  ON public.athlete_applications
  FOR INSERT
  WITH CHECK (true);

-- Only admins can read applications
CREATE POLICY "Admins can read applications"
  ON public.athlete_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can update status/notes
CREATE POLICY "Admins can update applications"
  ON public.athlete_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_athlete_application_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_athlete_application_ts ON public.athlete_applications;
CREATE TRIGGER update_athlete_application_ts
  BEFORE UPDATE ON public.athlete_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_athlete_application_timestamp();

SELECT 'Athlete Applications Table Created Successfully' AS status;
