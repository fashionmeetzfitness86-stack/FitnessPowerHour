-- This script patches the RLS policies for athlete_applications to include the 'god' role.
-- Currently, the 'god' role is getting "Failed to load applications" because the policies only check for 'admin' and 'super_admin'.

-- 1. Drop existing SELECT and UPDATE policies
DROP POLICY IF EXISTS "Admins can read applications" ON public.athlete_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.athlete_applications;

-- 2. Re-create SELECT policy with 'god' role
CREATE POLICY "Admins can read applications"
  ON public.athlete_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'god')
    )
  );

-- 3. Re-create UPDATE policy with 'god' role
CREATE POLICY "Admins can update applications"
  ON public.athlete_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'god')
    )
  );

-- Refresh cache
NOTIFY pgrst, 'reload schema';
