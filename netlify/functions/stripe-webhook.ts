import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, { apiVersion: '2025-04-30.basil' });

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
            .from('users')
            .update({ tier })
            .eq('id', userId);

          if (error) {
            console.error('[stripe-webhook] Failed to update user tier:', error);
          } else {
            console.log(`[stripe-webhook] User ${userId} upgraded to ${tier}`);
          }
        }

        if (metadata.type === 'shop' && userId) {
          console.log(`[stripe-webhook] Shop purchase for user ${userId}`);
          // Orders are tracked in Stripe — could also store in Supabase if needed
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
            .from('users')
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
