-- FMF HABIT SYSTEM & NOTIFICATION ENGINE
-- Purpose: Automates daily retention triggers, inactivity churn prevention, and weekly summaries.

-- 1. ENHANCE PROFILES TABLE FOR HABIT TRACKING
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS workouts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS videos_watched INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_notification_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_notification_sent_at TIMESTAMP WITH TIME ZONE;

-- 2. CREATE THE HABIT ENGINE FUNCTION
-- This evaluates every user in the platform and dispatches highly targeted notifications
CREATE OR REPLACE FUNCTION evaluate_fmf_habit_triggers()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    today_date DATE := CURRENT_DATE;
    yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
    days_inactive INTEGER;
    recent_checkin BOOLEAN;
    yesterday_checkin BOOLEAN;
BEGIN
    FOR user_record IN SELECT * FROM public.profiles WHERE role != 'super_admin' LOOP
        
        -- Safe evaluation of dates
        days_inactive := EXTRACT(DAY FROM (now() - COALESCE(user_record.last_workout_date, user_record.created_at)));
        recent_checkin := (user_record.last_checkin::date = today_date);
        yesterday_checkin := (user_record.last_checkin::date = yesterday_date);

        -- ========================================================
        -- 🛑 RULE 1: INACTIVITY REMINDERS (CHURN PREVENTION)
        -- ========================================================
        IF days_inactive = 2 AND (user_record.last_notification_sent_at < now() - INTERVAL '12 hours' OR user_record.last_notification_sent_at IS NULL) THEN
            INSERT INTO public.notifications (user_id, type, title, message, metadata) VALUES (
                user_record.id, 'retention', 'You’ve been off for 2 days.', 'Jump back in today. The hardest part is starting.', '{"route": "#/profile"}'
            );
            UPDATE public.profiles SET last_notification_type = 'inactive_2', last_notification_sent_at = now() WHERE id = user_record.id;
            CONTINUE;
        END IF;

        IF days_inactive = 5 AND (user_record.last_notification_sent_at < now() - INTERVAL '12 hours' OR user_record.last_notification_sent_at IS NULL) THEN
            INSERT INTO public.notifications (user_id, type, title, message, metadata) VALUES (
                user_record.id, 'retention', 'You’re losing momentum.', 'Let’s restart today before the habit breaks permanently.', '{"route": "#/profile"}'
            );
            UPDATE public.profiles SET last_notification_type = 'inactive_5', last_notification_sent_at = now() WHERE id = user_record.id;
            CONTINUE;
        END IF;

        IF days_inactive = 10 AND (user_record.last_notification_sent_at < now() - INTERVAL '12 hours' OR user_record.last_notification_sent_at IS NULL) THEN
            INSERT INTO public.notifications (user_id, type, title, message, metadata) VALUES (
                user_record.id, 'retention', 'Let’s reset. Start fresh today.', 'It doesn’t matter how long it’s been. Open the app and do 5 minutes.', '{"route": "#/profile"}'
            );
            UPDATE public.profiles SET last_notification_type = 'inactive_10', last_notification_sent_at = now() WHERE id = user_record.id;
            CONTINUE;
        END IF;

        -- ========================================================
        -- 🛑 RULE 2: MISSED DAY TRIGGER (POWERFUL PSYCHOLOGICALLY)
        -- ========================================================
        IF NOT yesterday_checkin AND NOT recent_checkin AND days_inactive < 2 AND (user_record.last_notification_sent_at < now() - INTERVAL '12 hours' OR user_record.last_notification_sent_at IS NULL) THEN
            INSERT INTO public.notifications (user_id, type, title, message, metadata) VALUES (
                user_record.id, 'habit', 'You missed yesterday.', 'Let’s get back on track today. Don’t let one day slip into two.', '{"route": "#/profile"}'
            );
            UPDATE public.profiles SET last_notification_type = 'missed_yesterday', last_notification_sent_at = now() WHERE id = user_record.id;
            CONTINUE;
        END IF;

        -- ========================================================
        -- 🛑 RULE 3: DAILY TIMED TRIGGER (MORNING)
        -- NOTE: This simulates sending at 8AM assuming job runs daily at 13:00 UTC
        -- ========================================================
        IF NOT recent_checkin AND user_record.streak_count > 0 AND (user_record.last_notification_sent_at < now() - INTERVAL '12 hours' OR user_record.last_notification_sent_at IS NULL) THEN
            INSERT INTO public.notifications (user_id, type, title, message, metadata) VALUES (
                user_record.id, 'habit', '🔥 Keep your streak alive.', 'Don’t break it today. Start your session now.', '{"route": "#/profile"}'
            );
            UPDATE public.profiles SET last_notification_type = 'morning_streak_push', last_notification_sent_at = now() WHERE id = user_record.id;
            CONTINUE;
        END IF;

        IF NOT recent_checkin AND (user_record.streak_count = 0 OR user_record.streak_count IS NULL) AND (user_record.last_notification_sent_at < now() - INTERVAL '12 hours' OR user_record.last_notification_sent_at IS NULL) THEN
             INSERT INTO public.notifications (user_id, type, title, message, metadata) VALUES (
                user_record.id, 'habit', 'You haven’t trained today.', 'Start your session now. Build the foundation.', '{"route": "#/profile"}'
            );
            UPDATE public.profiles SET last_notification_type = 'morning_routine_push', last_notification_sent_at = now() WHERE id = user_record.id;
            CONTINUE;
        END IF;

    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. AUTOMATE WEEKLY SUMMARY TRIGGER (RUNS EVERY SUNDAY)
CREATE OR REPLACE FUNCTION generate_weekly_fmf_summaries()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    weekly_workouts INTEGER;
BEGIN
    FOR user_record IN SELECT * FROM public.profiles WHERE role != 'super_admin' LOOP
        -- Count completed workouts over the last 7 days
        SELECT count(*) INTO weekly_workouts 
        FROM public.calendar_sessions 
        WHERE user_id = user_record.id AND status = 'completed' AND session_date >= (CURRENT_DATE - INTERVAL '7 days')::TEXT;

        IF weekly_workouts > 0 THEN
            INSERT INTO public.notifications (user_id, type, title, message, metadata) VALUES (
                user_record.id, 'summary', 'Your weekly results', 'Workouts: ' || weekly_workouts || ' | Let’s push further this week.', '{"route": "#/profile"}'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. SETUP CRON JOBS via pg_cron (if extension enabled on Supabase)
-- Note: If pg_cron isn't enabled, these functions exist safely to be called by an external Edge Function or Scheduler
DO $$
BEGIN
   -- Verify pg_cron is enabled before attempting to schedule
   IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
       -- Run daily habit engine at 1:00 PM UTC (equivalent to 8:00 AM EST)
       PERFORM cron.schedule('daily_fmf_habits', '0 13 * * *', 'SELECT evaluate_fmf_habit_triggers();');
       
       -- Run weekly summary every Sunday at 3:00 PM UTC
       PERFORM cron.schedule('weekly_fmf_summaries', '0 15 * * 0', 'SELECT generate_weekly_fmf_summaries();');
   END IF;
EXCEPTION WHEN OTHERS THEN
   -- Ignore if pg_cron layout restricts dynamic scheduling
   NULL;
END $$;
