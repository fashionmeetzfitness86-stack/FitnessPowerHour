CREATE TABLE IF NOT EXISTS public.admin_broadcast_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  recipient_type text NOT NULL,
  recipient_value text,
  scheduled_at timestamp with time zone,
  repeat_interval text,
  status text NOT NULL,
  sent_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.admin_broadcast_log ENABLE ROW LEVEL SECURITY;

-- Allow super_admin and admin full access
CREATE POLICY "Allow super_admin and admin full access to broadcast log"
  ON public.admin_broadcast_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
