import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://ujfpepmszqrptmcauqaa.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  if (!process.env.STRIPE_API_KEY) {
    return new Response(JSON.stringify({ error: 'System not connected to Stripe' }), { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_API_KEY, { apiVersion: '2026-02-25.clover' as any });

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
            
            // Notify User
            await supabase.from('notifications').insert({
                 user_id: userId,
                 type: 'purchase',
                 title: 'Membership Upgraded',
                 message: `Welcome to the ${tier} tier. Your kinetic potential is now unlocked.`,
                 status: 'sent',
                 send_at: new Date().toISOString()
            });

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
          
          let cartItems: Array<{id: string, q: number}> = [];
          try {
             if (metadata.cart_context) {
                cartItems = JSON.parse(metadata.cart_context);
             }
          } catch(e) { console.error('Failed to parse cart context', e); }

          if (cartItems.length > 0) {
              const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
              
              // 1. Create the base Order row
              const { data: insertedOrder, error: orderErr } = await supabase.from('orders').insert({
                 user_id: userId,
                 stripe_session_id: session.id,
                 total_amount: amountPaid,
                 status: 'paid',
                 shipping_address: session.customer_details?.address || null,
              }).select('id').single();

              if (!orderErr && insertedOrder) {
                  // 2. Fetch the corresponding products securely
                  const productIds = cartItems.map(i => i.id);
                  const { data: dbProducts } = await supabase.from('products').select('*').in('id', productIds);
                  
                  if (dbProducts) {
                      // Note: We use the exact price paid logic via dividing the total evenly to construct identical item structs, 
                      // or we rely on the product's base price to populate the item lines for simplicity if exact matching fails.
                      const orderItemsPayload = cartItems.map(cartItem => {
                         const match = dbProducts.find(p => p.id === cartItem.id);
                         return {
                            order_id: insertedOrder.id,
                            product_id: cartItem.id,
                            quantity: cartItem.q,
                            price: match ? match.price : 0
                         };
                      });
                      
                      
                      const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsPayload);
                      if (itemsErr) {
                         console.error('[stripe-webhook] Failed to insert order items:', itemsErr);
                      } else {
                         console.log(`[stripe-webhook] Order ${insertedOrder.id} successfully recorded with ${orderItemsPayload.length} items`);
                         // Fetch the purchaser's name for notification
                         const { data: userData } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
                         const userName = userData?.full_name || 'an unknown user';
                         
                         const { data: superAdmins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
                         if (superAdmins) {
                            const notifications = superAdmins.map(admin => ({
                              user_id: admin.id,
                              type: 'purchase',
                              title: 'New Pass / Shop Purchase',
                              message: `New storefront transaction approved for ${userName}.`,
                              status: 'sent',
                              send_at: new Date().toISOString(),
                              created_at: new Date().toISOString()
                            }));
                            await supabase.from('notifications').insert(notifications);
                         }
                      }
                  }
              } else {
                  if (orderErr?.code === '23505') {
                     console.log(`[stripe-webhook] Duplicate webhook event detected for session: ${session.id}, skipping.`);
                     return new Response('Duplicate event skipped', { status: 200 });
                  } else {
                     console.error('[stripe-webhook] Failed to insert foundational order node:', orderErr);
                  }
              }
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
             const { data: existingNotifs } = await supabase.from('notifications')
               .select('id')
               .like('message', `%[Event:${event.id}]%`);
             
             if (!existingNotifs || existingNotifs.length === 0) {
               const notifications = superAdmins.map(admin => ({
                 user_id: admin.id,
                 type: 'purchase',
                 title: 'Retreat Deposit Paid',
                 message: `Retreat deposit paid by ${userName}. [Event:${event.id}]`,
                 status: 'sent',
                 send_at: new Date().toISOString(),
                 created_at: new Date().toISOString()
               }));
               await supabase.from('notifications').insert(notifications);
             }
          }
        }

        if (metadata.type === 'service') {
          const serviceName = metadata.serviceName || 'Service Appointment';
          const date = metadata.date || new Date().toISOString().split('T')[0];
          const time = metadata.time || '12:00';
          const uId = metadata.userId;
          
          console.log(`[stripe-webhook] Service booking paid: ${serviceName} on ${date} at ${time}`);
          
          if (uId) {
            // Create a calendar session
            await supabase.from('calendar_sessions').insert({
              user_id: uId,
              title: `${serviceName} (${time})`,
              date: date,
              duration: 60,
              type: 'service',
              status: 'scheduled',
              created_at: new Date().toISOString()
            });
            
            // Get user name
            let userName = 'User';
            const { data: userData } = await supabase.from('profiles').select('full_name').eq('id', uId).single();
            if (userData) userName = userData.full_name;

            const { data: superAdmins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
            if (superAdmins) {
               const { data: existingNotifs } = await supabase.from('notifications')
                 .select('id')
                 .like('message', `%[Event:${event.id}]%`);

               if (!existingNotifs || existingNotifs.length === 0) {
                 const notifications = superAdmins.map(admin => ({
                   user_id: admin.id,
                   type: 'purchase',
                   title: 'Service Booked',
                   message: `New service booked: ${serviceName} by ${userName} for ${date} at ${time}. [Event:${event.id}]`,
                   status: 'sent',
                   send_at: new Date().toISOString(),
                   created_at: new Date().toISOString()
                 }));
                 await supabase.from('notifications').insert(notifications);
               }
            }
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
