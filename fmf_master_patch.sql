-- ============================================================
-- FMF PLATFORM — MASTER SQL PATCH
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. Add address column to profiles (if not exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Ensure notifications table has is_read column
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- 3. Guest booking fields on service_requests
ALTER TABLE public.service_requests ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS guest_phone TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0;

-- 4. Enable realtime on notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 5. RLS: Allow users to read their own notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users read own notifications'
  ) THEN
    CREATE POLICY "Users read own notifications" ON public.notifications
      FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users update own notifications'
  ) THEN
    CREATE POLICY "Users update own notifications" ON public.notifications
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- 6. Admins can insert notifications for any user (for broadcasts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Admins insert any notification'
  ) THEN
    CREATE POLICY "Admins insert any notification" ON public.notifications
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- 7. Streak milestone notification trigger
CREATE OR REPLACE FUNCTION trigger_streak_milestone_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.streak_count > OLD.streak_count THEN
    IF NEW.streak_count IN (7, 14, 30, 50, 100, 365) THEN
      INSERT INTO public.notifications (user_id, type, title, message, is_read)
      VALUES (
        NEW.id,
        'milestone',
        'Milestone: ' || NEW.streak_count || ' Day Streak!',
        'Your discipline compounds. ' || NEW.streak_count || ' consecutive days logged in FMF.',
        false
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_streak_milestone ON public.profiles;
CREATE TRIGGER on_streak_milestone
  AFTER UPDATE OF streak_count ON public.profiles
  FOR EACH ROW
  WHEN (NEW.streak_count IS DISTINCT FROM OLD.streak_count)
  EXECUTE FUNCTION trigger_streak_milestone_notification();

-- 8. Service request approval notification trigger
CREATE OR REPLACE FUNCTION trigger_service_request_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, is_read)
    VALUES (
      NEW.user_id,
      'service',
      'Service Approved',
      'Your request for ' || NEW.service_type || ' on ' || NEW.requested_date || ' has been approved.',
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_service_request_approved ON public.service_requests;
CREATE TRIGGER on_service_request_approved
  AFTER UPDATE OF status ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_service_request_approved();

-- Done!
SELECT 'FMF Master Patch Applied Successfully' AS status;
