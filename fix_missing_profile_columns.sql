-- FMF Schema Fix for Missing Profile Columns
DO $$
BEGIN
    BEGIN ALTER TABLE public.profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"billing_reminders":true,"payment_confirmations":true,"membership_renewals":true,"workout_reminders":false,"retreat_confirmations":true,"program_updates":true,"order_updates":true}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN height TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN weight TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN workout_style TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN training_goals TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN preferred_workout_days JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN preferred_workout_time TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN fitness_level TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN favorite_training_focus TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN limitations_or_injuries TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN short_bio TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN motivation TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN experience_level TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN last_tier_change_date TEXT; EXCEPTION WHEN duplicate_column THEN END;
END $$;
NOTIFY pgrst, 'reload schema';
