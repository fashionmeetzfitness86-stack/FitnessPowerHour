-- ============================================================
-- FMF PLATFORM — EMAIL WEBHOOK SETUP
-- Run this in Supabase SQL Editor
-- ============================================================

-- IMPORTANT: Replace 'https://your-netlify-site.netlify.app/api/email-webhook' 
-- with your actual Netlify production URL.

-- 1. Create a webhook function to call the Netlify endpoint
CREATE OR REPLACE FUNCTION trigger_email_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- We use pg_net to make an async HTTP request
  -- Make sure pg_net extension is enabled in Supabase (Database -> Extensions -> pg_net)
  PERFORM net.http_post(
    url := 'https://fitnesspowerhour.com/.netlify/functions/email-webhook', -- Your production Netlify URL
    headers := '{"Content-Type": "application/json", "x-webhook-secret": "fmf_secret_123"}'::jsonb,
    body := json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW)
    )::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_notification_created_send_email ON public.notifications;

-- 3. Create the trigger on the notifications table
CREATE TRIGGER on_notification_created_send_email
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_email_notification();

-- Confirm
SELECT 'Email Webhook Trigger Created Successfully' AS status;
