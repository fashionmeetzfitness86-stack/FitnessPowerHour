import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // TODO: TEMPORARY $1 pricing for live testing — revert to real prices after testing
  const MEMBERSHIP_PRICES: Record<string, { amount: number; name: string }> = {
    Basic: { amount: 100, name: 'Basic Membership' },
  };

  try {
    if (!process.env.STRIPE_API_KEY) {
      throw new Error('STRIPE_API_KEY missing - Platform cannot process payments until billing variables are linked in Netlify.');
    }

    const stripe = new Stripe(process.env.STRIPE_API_KEY, { apiVersion: '2026-02-25.clover' as any });

    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseKey) {
      throw new Error('Supabase key is missing in environment variables.');
    }
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || 'https://ujfpepmszqrptmcauqaa.supabase.co',
      supabaseKey
    );

    const body = await req.json();
    const { type, items, tier, userId, userEmail, successUrl, cancelUrl } = body;

    let origin = 'https://fitnesspowerhour.com';
    try { origin = new URL(req.url).origin; } catch(e) { origin = req.headers.get('origin') || origin; }

    if (type === 'membership') {
      // Membership subscription checkout
      const membership = MEMBERSHIP_PRICES[tier];
      if (!membership) {
        return new Response(JSON.stringify({ error: 'Invalid tier' }), { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: userEmail || undefined,
        metadata: {
          type: 'membership',
          tier,
          userId: userId || ''
        },
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: membership.name,
              description: `FitnessPowerHour ${tier} - Monthly subscription`
            },
            unit_amount: membership.amount,
            recurring: { interval: 'month' }
          },
          quantity: 1
        }],
        success_url: successUrl || `${origin}/#/profile?payment=success&tier=${encodeURIComponent(tier)}`,
        cancel_url: cancelUrl || `${origin}/#/membership?payment=cancelled`
      });

      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });

    } else if (type === 'shop') {
      // Secure Shop checkout
      if (!items || !items.length) {
        return new Response(JSON.stringify({ error: 'No items provided' }), { status: 400 });
      }



      // Pull product IDs to get real pricing securely from the DB
      const itemIds = items.map((i: any) => i.id);
      const { data: dbProducts } = await supabase.from('products').select('*').in('id', itemIds).eq('is_active', true);
      
      if (!dbProducts || dbProducts.length === 0) {
        return new Response(JSON.stringify({ error: 'Products are unavailable or do not exist in the database.' }), { status: 400 });
      }

      // Construct verified line items tracking correct member discounts
      const lineItems = items.map((clientItem: any) => {
        const dbProduct = dbProducts.find(p => p.id === clientItem.id);
        if (!dbProduct) return null;

        const basePrice = Number(dbProduct.price);

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: dbProduct.name,
              description: dbProduct.category || undefined
            },
            unit_amount: Math.round(basePrice * 100)
          },
          quantity: clientItem.quantity || 1
        };
      }).filter(Boolean); // Clear any null lines

      if (lineItems.length === 0) {
        return new Response(JSON.stringify({ error: 'Failed to construct checkout payload due to mismatched products.' }), { status: 400 });
      }

      // Pass precise item quantities securely
      const cartContextStr = JSON.stringify(items.map((i: any) => ({ id: i.id, q: i.quantity || 1 })));

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: userEmail || undefined,
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'ES', 'AU']
        },
        metadata: {
          type: 'shop',
          userId: userId || '',
          cart_context: cartContextStr // Embedded precisely for the webhook to execute fulfillment
        },
        line_items: lineItems,
        success_url: successUrl || `${origin}/#/profile?payment=success&type=shop`,
        cancel_url: cancelUrl || `${origin}/#/shop?payment=cancelled`
      });

      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });


    } else if (type === 'retreat_deposit') {
      const { retreatName, depositAmount, requestId, retreatId } = body;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: userEmail || undefined,
        metadata: {
          type: 'retreat_deposit',
          requestId,
          retreatId,
          userId: userId || ''
        },
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${retreatName} - 50% Deposit`,
              description: `Secure your spot for ${retreatName}`
            },
            unit_amount: Math.round(parseFloat(depositAmount || 0) * 100)
          },
          quantity: 1
        }],
        success_url: successUrl || `${origin}/#/profile?payment=success&type=retreat_deposit`,
        cancel_url: cancelUrl || `${origin}/#/profile`
      });

      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else if (type === 'service') {
      const { serviceName, priceAmount, selectedDate, selectedTime } = body;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: userEmail || undefined,
        metadata: {
          type: 'service',
          serviceName,
          date: selectedDate,
          time: selectedTime,
          userId: userId || ''
        },
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Service Booking: ${serviceName}`,
              description: `Appointment reserved for ${selectedDate} at ${selectedTime}`
            },
            unit_amount: Math.round(parseFloat(priceAmount || 0) * 100)
          },
          quantity: 1
        }],
        success_url: successUrl || `${origin}/#/profile?payment=success&type=service`,
        cancel_url: cancelUrl || `${origin}/`
      });

      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid checkout type. Use "membership", "shop", "local_pass" or "retreat_deposit".' }), { status: 400 });
    }

  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Checkout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
