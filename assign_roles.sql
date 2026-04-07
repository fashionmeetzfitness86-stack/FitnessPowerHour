-- First, ensure all foundational columns exist in the public.profiles table so it doesn't crash
DO $$ 
BEGIN
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "email" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'user'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "tier" TEXT NOT NULL DEFAULT 'Free Access'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'active'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "full_name" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "signup_date" TIMESTAMPTZ NOT NULL DEFAULT now(); EXCEPTION WHEN duplicate_column THEN END;
END $$;

NOTIFY pgrst, 'reload schema';

-- 1. Set full Super Admin Role
UPDATE public.profiles 
SET role = 'super_admin', 
    tier = 'Elite', 
    status = 'active'
WHERE id = (SELECT id FROM auth.users WHERE email = 'fashionmeetzfitness86@gmail.com');

-- 2. Set exclusive Athlete Role
UPDATE public.profiles 
SET role = 'athlete', 
    tier = 'Elite', 
    status = 'active'
WHERE id = (SELECT id FROM auth.users WHERE email = 'andersondjeemo@gmail.com');

-- 3. Verify the changes
SELECT u.email as auth_email, p.role, p.tier, p.status 
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email IN ('fashionmeetzfitness86@gmail.com', 'andersondjeemo@gmail.com');
