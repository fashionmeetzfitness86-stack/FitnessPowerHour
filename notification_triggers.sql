-- NOTIFICATION TRIGGER SYSTEM

-- 1. Notifications Table Setup (Ensure it exists)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'purchase', 'system', 'milestone', 'service', 'program'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'read'
    metadata JSONB,
    send_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Function to handle streak milestones
CREATE OR REPLACE FUNCTION trigger_streak_milestone_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.streak_count > OLD.streak_count THEN
        IF NEW.streak_count IN (7, 14, 30, 50, 100, 365) THEN
            INSERT INTO public.notifications (user_id, type, title, message)
            VALUES (
                NEW.id,
                'milestone',
                'Milestone Reached: ' || NEW.streak_count || ' Days',
                'Your discipline compounds. ' || NEW.streak_count || ' consecutive days logged in the FMF Matrix.'
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


-- Function to handle service request approval
CREATE OR REPLACE FUNCTION trigger_service_request_approved()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (
            NEW.user_id,
            'service',
            'Service Approved',
            'Your request for ' || NEW.service_type || ' has been approved. The kinetic pathway is clear.'
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


-- Function to handle Service Request submission (Admin Notification)
CREATE OR REPLACE FUNCTION trigger_service_request_submitted()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
BEGIN
    FOR admin_record IN SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin') LOOP
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (
            admin_record.id,
            'system',
            'New Service Request',
            'A new ' || NEW.service_type || ' request was submitted. Awaiting approval clearance.'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_service_request_submitted ON public.service_requests;
CREATE TRIGGER on_service_request_submitted
    AFTER INSERT ON public.service_requests
    FOR EACH ROW
    EXECUTE FUNCTION trigger_service_request_submitted();


-- Function to handle Referral Conversions
CREATE OR REPLACE FUNCTION trigger_referral_converted()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
BEGIN
    IF NEW.status = 'converted' AND OLD.status != 'converted' THEN
        -- Notify the Referrer
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (
            NEW.referrer_user_id,
            'milestone',
            'Referral Converted!',
            'An initiate has crossed over. Your referral network has expanded.'
        );
        -- Notify Admins
        FOR admin_record IN SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin') LOOP
            INSERT INTO public.notifications (user_id, type, title, message)
            VALUES (
                admin_record.id,
                'system',
                'Network Expansion',
                'A referral code was successfully converted to a paid member tier.'
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_referral_converted ON public.referrals;
CREATE TRIGGER on_referral_converted
    AFTER UPDATE OF status ON public.referrals
    FOR EACH ROW
    EXECUTE FUNCTION trigger_referral_converted();


-- Function to handle Program Assignments
CREATE OR REPLACE FUNCTION trigger_program_assignment()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
        NEW.user_id,
        'program',
        'New Program Assigned',
        'A new operational program has been assigned to your profile. Baseline adjustments are ready.'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The implementation of program assignments assumes a table named 'user_programs' or 'program_assignments'.
-- This is a soft trigger assuming 'user_programs' exists.
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_programs') THEN
        DROP TRIGGER IF EXISTS on_program_assigned ON public.user_programs;
        CREATE TRIGGER on_program_assigned
            AFTER INSERT ON public.user_programs
            FOR EACH ROW
            EXECUTE FUNCTION trigger_program_assignment();
    END IF;
END $$;


-- Function to handle Athlete Application Submissions
CREATE OR REPLACE FUNCTION trigger_athlete_application_submitted()
RETURNS TRIGGER AS $$
DECLARE
    admin_record RECORD;
BEGIN
    FOR admin_record IN SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin') LOOP
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (
            admin_record.id,
            'system',
            'New Athlete Application',
            'A new athlete application is awaiting review.'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'athlete_applications') THEN
        DROP TRIGGER IF EXISTS on_athlete_app_submitted ON public.athlete_applications;
        CREATE TRIGGER on_athlete_app_submitted
            AFTER INSERT ON public.athlete_applications
            FOR EACH ROW
            EXECUTE FUNCTION trigger_athlete_application_submitted();
    END IF;
END $$;
