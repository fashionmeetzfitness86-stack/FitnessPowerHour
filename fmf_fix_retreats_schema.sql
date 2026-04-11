-- Add missing columns to the retreats table
BEGIN;

DO $$ 
BEGIN
    -- Add location column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'retreats' AND column_name = 'location') THEN
        ALTER TABLE public.retreats ADD COLUMN location text;
    END IF;

    -- Add capacity column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'retreats' AND column_name = 'capacity') THEN
        ALTER TABLE public.retreats ADD COLUMN capacity integer DEFAULT 10;
    END IF;

    -- Add start_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'retreats' AND column_name = 'start_date') THEN
        ALTER TABLE public.retreats ADD COLUMN start_date timestamp with time zone;
    END IF;

    -- Add end_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'retreats' AND column_name = 'end_date') THEN
        ALTER TABLE public.retreats ADD COLUMN end_date timestamp with time zone;
    END IF;

    -- Add requirements column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'retreats' AND column_name = 'requirements') THEN
        ALTER TABLE public.retreats ADD COLUMN requirements text;
    END IF;
    
    -- Add cover_image just in case it doesn't exist, though it probably does
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'retreats' AND column_name = 'cover_image') THEN
        ALTER TABLE public.retreats ADD COLUMN cover_image text;
    END IF;

    -- Update schema cache for postgrest
    NOTIFY pgrst, 'reload schema';
END $$;

COMMIT;
