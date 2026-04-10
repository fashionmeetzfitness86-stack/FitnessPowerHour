BEGIN;

-- Allow guests to book without an auth account
ALTER TABLE public.service_requests ALTER COLUMN user_id DROP NOT NULL;

-- Add guest detail fields
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'guest_name') THEN
        ALTER TABLE public.service_requests ADD COLUMN guest_name text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'guest_email') THEN
        ALTER TABLE public.service_requests ADD COLUMN guest_email text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'guest_phone') THEN
        ALTER TABLE public.service_requests ADD COLUMN guest_phone text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_requests' AND column_name = 'amount_paid') THEN
        ALTER TABLE public.service_requests ADD COLUMN amount_paid numeric;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';

COMMIT;
