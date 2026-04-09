import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://ujfpepmszqrptmcauqaa.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Extract safe payment method details from a Stripe subscription
// ─────────────────────────────────────────────────────────────────────────────
async function getPaymentMethodDetails(stripe: Stripe, subscription: Stripe.Subscription) {
  try {
    const pmId = subscription.default_payment_method as string | null;
    if (!pmId) return null;
    const pm = await stripe.paymentMethods.retrieve(pmId);
    if (pm.card) {
      return {
        payment_method_brand: pm.card.brand,       // e.g. "visa"
        payment_method_last4: pm.card.last4,       // e.g. "4242"
        payment_method_exp_month: pm.card.exp_month,
        payment_method_exp_year: pm.card.exp_year,
      };
    }
  } catch (e) {
    console.error('[stripe-webhook] Failed to retrieve payment method:', e);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Upsert user_memberships with full Stripe billing data
// ─────────────────────────────────────────────────────────────────────────────
async function syncMembershipRecord(
  userId: string,
  subscription: Stripe.Subscription,
  paymentDetails: Record<string, any> | null
) {
  const periodEnd = subscription.current_period_end; // UNIX timestamp
  const nextBillingDate = new Date(periodEnd * 1000).toISOString();

  const upsertPayload: Record<string, any> = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    status: subscription.status === 'active' ? 'active' : subscription.status,
    started_at: new Date(subscription.start_date * 1000).toISOString(),
    renews_at: nextBillingDate,
    auto_pay_enabled: !subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  if (paymentDetails) {
    Object.assign(upsertPayload, paymentDetails);
  }

  // Try to update existing record first, then insert
  const { data: existing } = await supabase
    .from('user_memberships')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from('user_memberships')
      .update(upsertPayload)
      .eq('id', existing.id);
    if (error) console.error('[stripe-webhook] Failed to update user_memberships:', error);
  } else {
    const { error } = await supabase
      .from('user_memberships')
      .insert({ ...upsertPayload, created_at: new Date().toISOString() });
    if (error) console.error('[stripe-webhook] Failed to insert user_memberships:', error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Look up userId from profiles by stripe_customer_id or email
// ─────────────────────────────────────────────────────────────────────────────
async function findUserByStripeCustomer(stripe: Stripe, customerId: string): Promise<{ userId: string | null; email: string | null }> {
  // First try matching by stripe_customer_id column on profiles
  const { data: byCustomerId } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (byCustomerId?.id) return { userId: byCustomerId.id, email: byCustomerId.email };

  // Also try user_memberships table
  const { data: byMembership } = await supabase
    .from('user_memberships')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (byMembership?.user_id) {
    const { data: profile } = await supabase.from('profiles').select('id, email').eq('id', byMembership.user_id).maybeSingle();
    return { userId: byMembership.user_id, email: profile?.email || null };
  }

  // Fallback: look up by email in Stripe
  try {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    if (customer.email) {
      const { data: byEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customer.email)
        .maybeSingle();
      return { userId: byEmail?.id || null, email: customer.email };
    }
  } catch (e) {
    console.error('[stripe-webhook] Failed to retrieve customer from Stripe:', e);
  }

  return { userId: null, email: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN WEBHOOK HANDLER
// ─────────────────────────────────────────────────────────────────────────────
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

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
  } else {
    event = JSON.parse(body) as Stripe.Event;
  }

  console.log(`[stripe-webhook] Event: ${event.type}`);

  try {
    switch (event.type) {

      // ───────────────────────────────────────────────
      // CHECKOUT COMPLETED: One-time payments + subscriptions
      // ───────────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const userId = metadata.userId;

        // ── MEMBERSHIP subscription checkout ──
        if (metadata.type === 'membership' && userId) {
          const tier = metadata.tier || 'Basic';
          console.log(`[stripe-webhook] Membership checkout completed for user ${userId}, tier: ${tier}`);

          // Retrieve full subscription to get payment details + period end
          let subscription: Stripe.Subscription | null = null;
          if (session.subscription) {
            subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
              expand: ['default_payment_method']
            });
          }

          const stripeCustomerId = session.customer as string;
          const paymentDetails = subscription ? await getPaymentMethodDetails(stripe, subscription) : null;

          // ── 1. Update profiles table ──
          const profileUpdate: Record<string, any> = {
            tier: tier,
            membership_status: 'active',
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString(),
          };
          if (paymentDetails) {
            Object.assign(profileUpdate, {
              payment_method_brand: paymentDetails.payment_method_brand,
              payment_method_last4: paymentDetails.payment_method_last4,
            });
          }
          if (subscription) {
            profileUpdate.stripe_subscription_id = subscription.id;
          }

          const { error: profileErr } = await supabase
            .from('profiles')
            .update(profileUpdate)
            .eq('id', userId);

          if (profileErr) {
            console.error('[stripe-webhook] Failed to update profile:', profileErr);
          } else {
            console.log(`[stripe-webhook] Profile updated: user ${userId} → tier=${tier}, membership_status=active`);
          }

          // ── 2. Upsert user_memberships table ──
          if (subscription) {
            await syncMembershipRecord(userId, subscription, paymentDetails);
          } else {
            // Fallback for one-time payment (no subscription object)
            const { data: existing } = await supabase.from('user_memberships').select('id').eq('user_id', userId).maybeSingle();
            const membPayload: Record<string, any> = {
              user_id: userId,
              stripe_customer_id: stripeCustomerId,
              status: 'active',
              started_at: new Date().toISOString(),
              auto_pay_enabled: true,
              updated_at: new Date().toISOString(),
            };
            if (paymentDetails) Object.assign(membPayload, paymentDetails);
            if (existing?.id) {
              await supabase.from('user_memberships').update(membPayload).eq('id', existing.id);
            } else {
              await supabase.from('user_memberships').insert({ ...membPayload, created_at: new Date().toISOString() });
            }
          }

          // ── 3. Send user notification ──
          const { data: userData } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
          const userName = userData?.full_name || 'Athlete';

          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'purchase',
            title: 'Membership Activated',
            message: `Your ${tier} membership is now active. Full access unlocked. Welcome to the system.`,
            status: 'sent',
            send_at: new Date().toISOString()
          });

          // ── 4. Notify super admins ──
          const { data: superAdmins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
          if (superAdmins) {
            const notifications = superAdmins.map(admin => ({
              user_id: admin.id,
              type: 'purchase',
              title: 'New Membership Purchased',
              message: `${tier} membership purchased by ${userName}.`,
              status: 'sent',
              send_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            }));
            await supabase.from('notifications').insert(notifications);
          }
        }

        // ── SHOP purchase ──
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

            const { data: insertedOrder, error: orderErr } = await supabase.from('orders').insert({
              user_id: userId,
              stripe_session_id: session.id,
              total_amount: amountPaid,
              status: 'paid',
              shipping_address: session.customer_details?.address || null,
           }).select('id').single();

            if (!orderErr && insertedOrder) {
              const productIds = cartItems.map(i => i.id);
              const { data: dbProducts } = await supabase.from('products').select('*').in('id', productIds);

              if (dbProducts) {
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
                  console.log(`[stripe-webhook] Order ${insertedOrder.id} recorded with ${orderItemsPayload.length} items`);
                  const { data: uData } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
                  const uName = uData?.full_name || 'an unknown user';
                  const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
                  if (admins) {
                    await supabase.from('notifications').insert(admins.map(admin => ({
                      user_id: admin.id,
                      type: 'purchase',
                      title: 'New Shop Purchase',
                      message: `Storefront transaction approved for ${uName}.`,
                      status: 'sent',
                      send_at: new Date().toISOString(),
                      created_at: new Date().toISOString()
                    })));
                  }
                }
              }
            } else if (orderErr?.code === '23505') {
              console.log(`[stripe-webhook] Duplicate event for session: ${session.id}, skipping.`);
              return new Response('Duplicate event skipped', { status: 200 });
            } else {
              console.error('[stripe-webhook] Failed to insert order:', orderErr);
            }
          }
        }

        // ── RETREAT DEPOSIT ──
        if (metadata.type === 'retreat_deposit') {
          const requestId = metadata.requestId;
          const uId = metadata.userId;
          console.log(`[stripe-webhook] Retreat deposit paid for request ${requestId}`);

          if (requestId) {
            await supabase.from('retreat_requests').update({
              status: 'deposit_paid',
              stripe_session_id: session.id,
              amount_paid: session.amount_total ? session.amount_total / 100 : 0
            }).eq('id', requestId);
          }

          let userName = 'User';
          if (uId) {
            const { data: uData } = await supabase.from('profiles').select('full_name').eq('id', uId).single();
            if (uData) userName = uData.full_name;
          }

          const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
          if (admins) {
            const { data: existingNotifs } = await supabase.from('notifications').select('id').like('message', `%[Event:${event.id}]%`);
            if (!existingNotifs || existingNotifs.length === 0) {
              await supabase.from('notifications').insert(admins.map(admin => ({
                user_id: admin.id,
                type: 'purchase',
                title: 'Retreat Deposit Paid',
                message: `Retreat deposit paid by ${userName}. [Event:${event.id}]`,
                status: 'sent',
                send_at: new Date().toISOString(),
                created_at: new Date().toISOString()
              })));
            }
          }
        }

        // ── SERVICE BOOKING ──
        if (metadata.type === 'service') {
          const serviceName = metadata.serviceName || 'Service Appointment';
          const date = metadata.date || new Date().toISOString().split('T')[0];
          const time = metadata.time || '12:00';
          const uId = metadata.userId;

          console.log(`[stripe-webhook] Service booking paid: ${serviceName} on ${date} at ${time}`);

          if (uId) {
            await supabase.from('calendar_sessions').insert({
              user_id: uId,
              source_type: 'service',
              title: `${serviceName} (${time})`,
              session_date: date,
              session_time: time,
              duration_minutes: 60,
              status: 'approved',
              created_at: new Date().toISOString()
            });

            let userName = 'User';
            const { data: uData } = await supabase.from('profiles').select('full_name').eq('id', uId).single();
            if (uData) userName = uData.full_name;

            const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'super_admin');
            if (admins) {
              const { data: existingNotifs } = await supabase.from('notifications').select('id').like('message', `%[Event:${event.id}]%`);
              if (!existingNotifs || existingNotifs.length === 0) {
                await supabase.from('notifications').insert(admins.map(admin => ({
                  user_id: admin.id,
                  type: 'purchase',
                  title: 'Service Booked',
                  message: `New service booked: ${serviceName} by ${userName} for ${date} at ${time}. [Event:${event.id}]`,
                  status: 'sent',
                  send_at: new Date().toISOString(),
                  created_at: new Date().toISOString()
                })));
              }
            }
          }
        }
        break;
      }

      // ───────────────────────────────────────────────
      // INVOICE PAID: Subscription renewal — update next billing date
      // ───────────────────────────────────────────────
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const { userId } = await findUserByStripeCustomer(stripe, customerId);
        if (!userId) {
          console.warn(`[stripe-webhook] invoice.paid: No user found for customer ${customerId}`);
          break;
        }

        // Fetch full subscription with expanded payment method
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['default_payment_method']
        });
        const paymentDetails = await getPaymentMethodDetails(stripe, subscription);
        const nextBillingDate = new Date(subscription.current_period_end * 1000).toISOString();

        // Update profiles
        const profileUpdate: Record<string, any> = {
          membership_status: 'active',
          updated_at: new Date().toISOString(),
        };
        if (paymentDetails) {
          profileUpdate.payment_method_brand = paymentDetails.payment_method_brand;
          profileUpdate.payment_method_last4 = paymentDetails.payment_method_last4;
        }
        await supabase.from('profiles').update(profileUpdate).eq('id', userId);

        // Update user_memberships - next billing date
        await syncMembershipRecord(userId, subscription, paymentDetails);

        console.log(`[stripe-webhook] invoice.paid: User ${userId} membership renewed → next billing ${nextBillingDate}`);
        break;
      }

      // ───────────────────────────────────────────────
      // SUBSCRIPTION UPDATED: Plan changes, cancellation schedules
      // ───────────────────────────────────────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { userId } = await findUserByStripeCustomer(stripe, customerId);
        if (!userId) {
          console.warn(`[stripe-webhook] subscription.updated: No user found for customer ${customerId}`);
          break;
        }

        const paymentDetails = await getPaymentMethodDetails(stripe, subscription);
        await syncMembershipRecord(userId, subscription, paymentDetails);

        // If cancel_at_period_end was set, reflect that
        const profileUpdate: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };
        if (subscription.cancel_at_period_end) {
          profileUpdate.membership_status = 'canceling'; // Will become inactive at period end
        }
        await supabase.from('profiles').update(profileUpdate).eq('id', userId);

        console.log(`[stripe-webhook] subscription.updated: User ${userId}, cancel_at_period_end=${subscription.cancel_at_period_end}`);
        break;
      }

      // ───────────────────────────────────────────────
      // SUBSCRIPTION DELETED: Hard cancellation → revoke access
      // ───────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { userId, email } = await findUserByStripeCustomer(stripe, customerId);

        if (!userId) {
          console.warn(`[stripe-webhook] subscription.deleted: No user found for customer ${customerId} / email ${email}`);
          break;
        }

        // Revoke access on profiles
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({
            tier: 'Free',
            membership_status: 'inactive',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (profileErr) {
          console.error('[stripe-webhook] Failed to downgrade profile:', profileErr);
        } else {
          console.log(`[stripe-webhook] subscription.deleted: User ${userId} downgraded to Free/inactive`);
        }

        // Update user_memberships record
        await supabase
          .from('user_memberships')
          .update({
            status: 'canceled',
            ends_at: new Date().toISOString(),
            auto_pay_enabled: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        // Notify user
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'membership',
          title: 'Membership Cancelled',
          message: 'Your FMF membership has been cancelled. You can re-subscribe at any time to restore full access.',
          status: 'sent',
          send_at: new Date().toISOString()
        });

        break;
      }

      // ───────────────────────────────────────────────
      // INVOICE PAYMENT FAILED: Mark as past_due
      // ───────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { userId } = await findUserByStripeCustomer(stripe, customerId);
        if (!userId) break;

        await supabase
          .from('user_memberships')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('user_id', userId);

        await supabase.from('profiles').update({
          membership_status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('id', userId);

        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'billing',
          title: 'Payment Failed',
          message: 'Your last membership payment failed. Please update your payment method to maintain access.',
          status: 'sent',
          send_at: new Date().toISOString()
        });

        console.log(`[stripe-webhook] invoice.payment_failed: User ${userId} marked as past_due`);
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
