-- Add missing columns to the notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create the admin broadcast log table for retaining history of pushed notifications
CREATE TABLE IF NOT EXISTS public.admin_broadcast_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  recipient_value TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'sent',
  sent_count INTEGER DEFAULT 0,
  repeat_interval TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Turn on Row Level Security for admin_broadcast_log
ALTER TABLE public.admin_broadcast_log ENABLE ROW LEVEL SECURITY;

-- Allow super admins full access to the admin_broadcast_log
CREATE POLICY "Super Admins can manage broadcast logs"
ON public.admin_broadcast_log
FOR ALL
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin' OR role = 'admin')
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'super_admin' OR role = 'admin')
);

-- Force refresh the schema cache so Supabase recognizes the new columns immediately
NOTIFY pgrst, 'reload schema';
