-- Fix service_requests foreign key constraint
ALTER TABLE public.service_requests
DROP CONSTRAINT IF EXISTS service_requests_user_id_fkey;

ALTER TABLE public.service_requests
ADD CONSTRAINT service_requests_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
