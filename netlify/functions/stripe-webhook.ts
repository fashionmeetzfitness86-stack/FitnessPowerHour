import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, { apiVersion: '2026-02-25.clover' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://ujfpepmszqrptmcauqaa.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  // If webhook secret is configured, verify signature
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
  } else {
    // No webhook secret — parse event directly (dev/testing)
    event = JSON.parse(body) as Stripe.Event;
  }

  console.log(`[stripe-webhook] Event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const userId = metadata.userId;

        if (metadata.type === 'membership' && userId) {
          const tier = metadata.tier;
          console.log(`[stripe-webhook] Membership payment for user ${userId}, tier: ${tier}`);

          // Update user tier in DB
          const { error } = await supabase
            .from('profiles')
            .update({ tier })
            .eq('id', userId);


          // Fetch the purchaser's name
          const { data: userData } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
          const userName = userData?.full_name || 'an unknown user';
          
          if (error) {
            console.error('[stripe-webhook] Failed to update user tier:', error);
          } else {
            console.log(`[stripe-webhook] User ${userId} upgraded to ${tier}`);
            
            // Notify Super Admins
            const { data: superAdmins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
            if (superAdmins) {
              const notifications = superAdmins.map(admin => ({
                user_id: admin.id,
                type: 'purchase',
                title: 'New Membership Purchased',
                message: `The ${tier} membership was just purchased by ${userName}.`,
                status: 'sent', // using 'sent' to ensure it's marked as unread in your UI logic typically
                send_at: new Date().toISOString(),
                created_at: new Date().toISOString()
              }));
              await supabase.from('notifications').insert(notifications);
            }
          }
        }

        if (metadata.type === 'shop' && userId) {
          console.log(`[stripe-webhook] Shop purchase for user ${userId}`);
          // Fetch the purchaser's name
          const { data: userData } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
          const userName = userData?.full_name || 'an unknown user';
          
          // Orders are tracked in Stripe — could also store in Supabase if needed
          const { data: superAdmins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
          if (superAdmins) {
             const notifications = superAdmins.map(admin => ({
               user_id: admin.id,
               type: 'purchase',
               title: 'New Pass / Shop Purchase',
               message: `A new pass or shop item was purchased by ${userName}.`,
               status: 'sent',
               send_at: new Date().toISOString(),
               created_at: new Date().toISOString()
             }));
             await supabase.from('notifications').insert(notifications);
          }
        }

        if (metadata.type === 'local_pass') {
          const passType = metadata.passName || 'Local Pass';
          const passName = `${metadata.firstName || 'Guest'} ${metadata.lastName || ''}`;
          console.log(`[stripe-webhook] Local Pass purchase: ${passType} for ${passName}`);
          
          let userId = metadata.userId;

          // Note: userId might not be present if it's a guest purchase. Use a placeholder or matching logic
          // Determine expiration based on passType
          let expiresAt: Date | undefined;
          if (passType.includes('3-Day')) expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
          else if (passType.includes('7-Day')) expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          else expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // generic 30 days

          // Generate Token
          const token = `PASS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

          // If session id exists, try to extract passId if we embedded it, but we didn't, so use session id
          const sessionId = session.id;

          await supabase.from('passes').insert({
            user_id: userId || null,
            pass_type: passType,
            token: sessionId, // we can use Stripe sessionId to match against the success redirect passId!!
            status: 'valid',
            expires_at: expiresAt.toISOString()
          });

          // Notificaton
          const { data: superAdmins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
          if (superAdmins) {
             const notifications = superAdmins.map(admin => ({
               user_id: admin.id,
               type: 'purchase',
               title: 'New Pass Purchased',
               message: `New ${passType} purchased by ${passName}.`,
               status: 'sent',
               send_at: new Date().toISOString(),
               created_at: new Date().toISOString()
             }));
             await supabase.from('notifications').insert(notifications);
          }
        }

        if (metadata.type === 'retreat_deposit') {
          const requestId = metadata.requestId;
          const retreatId = metadata.retreatId;
          const uId = metadata.userId;
          console.log(`[stripe-webhook] Retreat deposit paid for request ${requestId}`);
          
          if (requestId) {
            await supabase.from('retreat_requests').update({
              status: 'deposit_paid',
              stripe_session_id: session.id,
              amount_paid: session.amount_total ? session.amount_total / 100 : 0
            }).eq('id', requestId);
          }
          
          // Get user name
          let userName = 'User';
          if (uId) {
             const { data: userData } = await supabase.from('profiles').select('full_name').eq('id', uId).single();
             if (userData) userName = userData.full_name;
          }

          const { data: superAdmins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
          if (superAdmins) {
             const notifications = superAdmins.map(admin => ({
               user_id: admin.id,
               type: 'purchase',
               title: 'Retreat Deposit Paid',
               message: `Retreat deposit paid by ${userName}.`,
               status: 'sent',
               send_at: new Date().toISOString(),
               created_at: new Date().toISOString()
             }));
             await supabase.from('notifications').insert(notifications);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        // Subscription cancelled — downgrade to Free Access
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Look up user by Stripe customer ID or email
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        if (customer.email) {
          const { error } = await supabase
            .from('profiles')
            .update({ tier: 'Free Access' })
            .eq('email', customer.email);

          if (error) {
            console.error('[stripe-webhook] Failed to downgrade user:', error);
          } else {
            console.log(`[stripe-webhook] User ${customer.email} downgraded to Free Access`);
          }
        }
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event: ${event.type}`);
    }
  } catch (err: any) {
    console.error('[stripe-webhook] Handler error:', err);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
