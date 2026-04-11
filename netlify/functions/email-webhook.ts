import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const resend = new Resend(process.env.RESEND_API_KEY || '');

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    user_id: string | null;
    type: string; // 'system', 'milestone', 'service', 'social', etc.
    title: string;
    message: string;
    metadata?: any;
    created_at: string;
  };
  old_record: null;
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Very basic security: Check if the webhook includes a secret
  // In production, configure webhook secrets in Supabase and check them here
  const webhookSecret = event.headers['x-webhook-secret'];
  if (process.env.WEBHOOK_SECRET && webhookSecret !== process.env.WEBHOOK_SECRET) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const payload = JSON.parse(event.body || '{}') as WebhookPayload;

    if (payload.type !== 'INSERT' || payload.table !== 'notifications') {
      return { statusCode: 400, body: 'Ignored payload type/table' };
    }

    const { user_id, title, message, type } = payload.record;

    if (!user_id) {
      console.log('No user_id found in notification, skipping email');
      return { statusCode: 200, body: 'No user to email' };
    }

    // 1. Get the user's email and preferences
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name, notification_preferences')
      .eq('id', user_id)
      .single();

    if (userError || !user || !user.email) {
      console.error('Failed to get user profile or no email:', userError);
      return { statusCode: 500, body: 'Error fetching user' };
    }

    const prefs = user.notification_preferences || {};

    // 2. Decide if we should send an email based on preferences
    let shouldSend = true;

    // We can map notification type/title to preference toggles
    // E.g. skip if it's a social notification and they disabled some social stuff
    // For now, only send critical stuff or if specifically enabled
    
    // Example: If it's a workout plan reminder, check `workout_reminders`
    if (type === 'workout' || title.toLowerCase().includes('workout')) {
      shouldSend = prefs.workout_reminders === true;
    }

    if (!shouldSend) {
      console.log('User opted out of this type of notification.');
      return { statusCode: 200, body: 'Skipped due to preferences' };
    }

    // 3. Send email via Resend
    // Format basic HTML template
    const htmlEmail = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <h1 style="color: #4df0d4; margin: 0; font-size: 24px; text-transform: uppercase;">Fitness Power Hour</h1>
        </div>
        <div style="padding: 30px 20px; background-color: #fafafa; border: 1px solid #eee;">
          <h2 style="margin-top: 0;">Hi ${user.full_name || 'Member'},</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            <strong>${title}</strong>
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            ${message}
          </p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://fitnesspowerhour.com" style="display: inline-block; background-color: #000; color: #4df0d4; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; font-size: 14px;">Open FMF Dashboard</a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #aaa;">
          <p>You received this because of your notification settings at Fashion Meetz Fitness.</p>
        </div>
      </div>
    `;

    const sendResult = await resend.emails.send({
      from: 'FMF Platform <notifications@fitnesspowerhour.com>', // Important: You must verify this domain in Resend
      to: [user.email],
      subject: title,
      html: htmlEmail,
    });

    if (sendResult.error) {
      console.error('Resend error:', sendResult.error);
      return { statusCode: 500, body: JSON.stringify(sendResult.error) };
    }

    console.log('Email sent successfully:', sendResult.data);
    return { statusCode: 200, body: JSON.stringify(sendResult.data) };

  } catch (err: any) {
    console.error('Webhook error:', err);
    return { statusCode: 500, body: err.message };
  }
};
