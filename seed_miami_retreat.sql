-- ============================================================
-- FMF — Seed Miami Beach Transformation Retreat
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Ensure retreats table has all columns the app expects
DO $$
BEGIN
  BEGIN ALTER TABLE public.retreats ADD COLUMN title TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN description TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN location TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN price NUMERIC DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN capacity INTEGER DEFAULT 10; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN visibility_status TEXT DEFAULT 'draft'; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN is_sold_out BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN cover_image TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN requirements TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN start_date TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN end_date TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN access_type TEXT DEFAULT 'manual'; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN created_by UUID; EXCEPTION WHEN duplicate_column THEN END;
  -- Extra columns used by the app's Retreat type
  BEGIN ALTER TABLE public.retreats ADD COLUMN allowed_packages JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN allowed_users JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN preview_enabled BOOLEAN DEFAULT true; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreats ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- 2. Ensure retreat_applications table exists and has the expected columns
CREATE TABLE IF NOT EXISTS public.retreat_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retreat_id UUID REFERENCES public.retreats(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  user_email TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  message TEXT,
  phone TEXT,
  amount_paid NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns to retreat_applications
DO $$
BEGIN
  BEGIN ALTER TABLE public.retreat_applications ADD COLUMN amount_paid NUMERIC DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreat_applications ADD COLUMN admin_notes TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreat_applications ADD COLUMN phone TEXT; EXCEPTION WHEN duplicate_column THEN END;
  BEGIN ALTER TABLE public.retreat_applications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- 3. RLS policies for retreats (public can view published)
ALTER TABLE public.retreats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published retreats" ON public.retreats;
CREATE POLICY "Public can view published retreats" ON public.retreats
  FOR SELECT USING (visibility_status = 'published');

DROP POLICY IF EXISTS "Admins manage retreats" ON public.retreats;
CREATE POLICY "Admins manage retreats" ON public.retreats
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
  );

-- 4. RLS policies for retreat_applications
ALTER TABLE public.retreat_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert retreat applications" ON public.retreat_applications;
CREATE POLICY "Users can insert retreat applications" ON public.retreat_applications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view retreat applications" ON public.retreat_applications;
CREATE POLICY "Admins can view retreat applications" ON public.retreat_applications
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Admins can update retreat applications" ON public.retreat_applications;
CREATE POLICY "Admins can update retreat applications" ON public.retreat_applications
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin'))
  );

-- 5. Seed the Miami Beach Transformation Retreat
-- Only insert if a retreat with this title does not already exist
INSERT INTO public.retreats (
  id,
  title,
  description,
  location,
  price,
  capacity,
  visibility_status,
  is_sold_out,
  cover_image,
  requirements,
  start_date,
  end_date,
  access_type,
  allowed_packages,
  allowed_users,
  preview_enabled,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  'Miami Beach Transformation Retreat',
  E'🏝️ THE EXPERIENCE\n\nThis is not a vacation.\nThis is a full lifestyle reset.\n\nFor a limited time, you will step into the FMF system:\n\n• Structured daily training\n• Clean discipline-driven routine\n• Elite Miami Beach environment\n• Direct access to high-level coaching\n\nYou don''t come here to "try fitness."\nYou come here to transform your body, your habits, and your mindset.\n\n💰 PROGRAM OPTIONS\n\n🔹 2-WEEK TRANSFORMATION — $15,000\nDuration: June 1st – June 14th (14 Days)\n\nPerfect for:\n• Rapid reset\n• Fat loss / conditioning\n• Breaking bad habits\n• Rebuilding discipline\n\nIncludes:\n• 2 daily training sessions (morning + evening)\n• Beach workouts + rooftop sessions\n• Mobility, recovery & stretching sessions\n• Daily structure & coaching\n• Nutrition guidance\n• Lifestyle discipline framework\n\n🔸 1-MONTH FULL IMMERSION — $25,000\nDuration: June 1st – June 30th (30 Days)\n⚠️ STRICTLY LIMITED: ONLY 4 SPOTS AVAILABLE\n\nThis is the complete transformation.\n\nPerfect for:\n• Total body recomposition\n• Long-term habit installation\n• High-level physical and mental upgrade\n• Lifestyle overhaul\n\nIncludes everything from the 2-week program +:\n• Deeper coaching & performance tracking\n• Advanced calisthenics progression\n• Extended recovery & regeneration protocols\n• Full integration into the FMF lifestyle system\n• Stronger accountability & structure\n\n🏋️ DAILY STRUCTURE (EXAMPLE)\n8:30 AM — Rooftop Training (Strength / Calisthenics)\n10:00 AM — Beach Workout (Conditioning / Mobility)\nAfternoon — Recovery / Sauna / Stretching\nEvening — Optional Training / Lifestyle Integration\n\n📍 LOCATIONS\nMiami Beach (Primary)\nRooftop training (hotel partnerships)\nBeach training zones\nPrivate workout environments\n\nExact details provided upon confirmation.\n\n🧠 WHAT YOU GAIN\n• Discipline\n• Structure\n• Lean, athletic body\n• Increased energy\n• Mental clarity\n• Stronger identity\n\nThis is not temporary.\nThis is who you become after the program.',
  'Miami Beach, FL',
  15000,
  4,
  'published',
  false,
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
  'Application Required. No Refunds Once Confirmed. Must Be 21+ To Attend. Limited Spots Available.',
  '2026-06-01T09:00:00Z',
  '2026-06-30T17:00:00Z',
  'package_based',
  '["elite"]'::jsonb,
  '[]'::jsonb,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.retreats WHERE title = 'Miami Beach Transformation Retreat'
);

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';
