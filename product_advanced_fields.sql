-- Run this inside your Supabase SQL Editor to add the new Product fields.

DO $$ 
BEGIN
    BEGIN ALTER TABLE public.products ADD COLUMN sizes TEXT[] DEFAULT array[]::TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.products ADD COLUMN inventory_count INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.products ADD COLUMN gender VARCHAR(50); EXCEPTION WHEN duplicate_column THEN END;
END $$;
