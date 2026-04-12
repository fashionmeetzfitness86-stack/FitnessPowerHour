ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"billing_reminders": true, "payment_confirmations": true, "membership_renewals": true, "workout_reminders": true, "retreat_confirmations": true, "program_updates": true, "order_updates": true}'::jsonb;

-- Run a quick schema cache refresh to guarantee postgREST picks up the change
NOTIFY pgrst, 'reload schema';
