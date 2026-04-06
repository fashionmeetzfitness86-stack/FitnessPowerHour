ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

NOTIFY pgrst, 'reload schema';
