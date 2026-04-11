import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');
const FROM = 'FMF Platform <notifications@fitnesspowerhour.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'andersonlucas770@gmail.com';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { name, email, decision, notes } = JSON.parse(event.body || '{}');

    if (!name || !email) return { statusCode: 400, body: 'Missing name or email' };

    // ── Confirmation to applicant ──────────────────────────────────
    if (!decision) {
      // Initial submission confirmation
      await resend.emails.send({
        from: FROM,
        to: [email],
        subject: 'Your FMF Athlete Application Has Been Received',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px 30px; border-radius: 16px;">
            <h1 style="color: #4df0d4; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px;">Fashion Meetz Fitness</h1>
            <p style="color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 40px;">Elite Athlete Program</p>

            <h2 style="font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">Hi ${name},</h2>
            <p style="font-size: 15px; color: #aaa; line-height: 1.7;">
              Thank you for applying to become an <strong style="color: #fff;">FMF Athlete</strong>. We've received your application and our team will review your profile carefully.
            </p>

            <div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; margin: 30px 0;">
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #555; margin: 0 0 8px;">What happens next?</p>
              <ul style="color: #aaa; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                <li>Our team reviews your application (3–5 business days)</li>
                <li>You'll receive an approval or feedback email</li>
                <li>Approved athletes gain access to the FMF Athlete Portal</li>
              </ul>
            </div>

            <a href="https://fitnesspowerhour.com" style="display: inline-block; background: #4df0d4; color: #000; padding: 14px 28px; border-radius: 100px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; margin-top: 10px;">
              Visit FMF Platform
            </a>

            <p style="color: #333; font-size: 11px; margin-top: 40px;">Fashion Meetz Fitness · fitnesspowerhour.com</p>
          </div>
        `,
      });

      // Notify admin of new application
      await resend.emails.send({
        from: FROM,
        to: [ADMIN_EMAIL],
        subject: `New Athlete Application: ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 30px; border-radius: 12px;">
            <h2 style="color: #f97316; text-transform: uppercase;">New Athlete Application</h2>
            <p><strong>${name}</strong> (${email}) just submitted an athlete application.</p>
            <a href="https://fitnesspowerhour.com/#/admin/dashboard" style="display: inline-block; background: #f97316; color: #000; padding: 12px 24px; border-radius: 8px; font-weight: 900; font-size: 12px; text-transform: uppercase; text-decoration: none; margin-top: 16px;">
              Review in Admin Dashboard
            </a>
          </div>
        `,
      });

      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    // ── Decision email to applicant ────────────────────────────────
    const approved = decision === 'approved';
    await resend.emails.send({
      from: FROM,
      to: [email],
      subject: approved ? 'You've Been Approved as an FMF Athlete! 🎉' : 'Your FMF Athlete Application Update',
      html: approved ? `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px 30px; border-radius: 16px;">
          <h1 style="color: #4df0d4; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Fashion Meetz Fitness</h1>
          <h2 style="font-size: 26px; font-weight: 900; text-transform: uppercase; margin-top: 32px;">
            Welcome to the <span style="color: #4df0d4;">Roster</span>, ${name}!
          </h2>
          <p style="font-size: 15px; color: #aaa; line-height: 1.7;">
            We're thrilled to welcome you as an official <strong style="color: #fff;">FMF Athlete</strong>. You are now part of our elite collective of coaches and performers.
          </p>
          ${notes ? `<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; margin: 24px 0;"><p style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #555;">A note from the team:</p><p style="color: #ccc; font-size: 14px; line-height: 1.6;">${notes}</p></div>` : ''}
          <a href="https://fitnesspowerhour.com/#/athletes" style="display: inline-block; background: #4df0d4; color: #000; padding: 14px 28px; border-radius: 100px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; margin-top: 16px;">
            View Athletes Directory
          </a>
          <p style="color: #333; font-size: 11px; margin-top: 40px;">Fashion Meetz Fitness · fitnesspowerhour.com</p>
        </div>
      ` : `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px 30px; border-radius: 16px;">
          <h1 style="color: #4df0d4; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Fashion Meetz Fitness</h1>
          <h2 style="font-size: 22px; font-weight: 900; text-transform: uppercase; margin-top: 32px;">Hi ${name},</h2>
          <p style="font-size: 15px; color: #aaa; line-height: 1.7;">
            Thank you for your interest in the FMF Athlete Program. After careful review, we are not moving forward with your application at this time.
          </p>
          ${notes ? `<div style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; margin: 24px 0;"><p style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #555;">Feedback from the team:</p><p style="color: #ccc; font-size: 14px; line-height: 1.6;">${notes}</p></div>` : ''}
          <p style="color: #aaa; font-size: 14px;">We encourage you to continue growing and consider re-applying in the future. You're always welcome as a member of our community.</p>
          <a href="https://fitnesspowerhour.com/#/membership" style="display: inline-block; background: #fff; color: #000; padding: 14px 28px; border-radius: 100px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; margin-top: 16px;">
            Join as a Member
          </a>
          <p style="color: #333; font-size: 11px; margin-top: 40px;">Fashion Meetz Fitness · fitnesspowerhour.com</p>
        </div>
      `,
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err: any) {
    console.error('Email function error:', err);
    return { statusCode: 500, body: err.message };
  }
};
