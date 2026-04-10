-- FMF Schema Fix for Retreats Module
CREATE TABLE IF NOT EXISTS public.retreats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
END $$;

NOTIFY pgrst, 'reload schema';
