import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, { apiVersion: '2026-02-25.clover' });

const MEMBERSHIP_PRICES: Record<string, { amount: number; name: string }> = {
  Basic: { amount: 1999, name: 'Basic Membership' },
  Elite: { amount: 5900, name: 'Elite Membership' },
  'Local Collective': { amount: 29900, name: 'Local Collective Membership' }
};

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

  try {
    const body = await req.json();
    const { type, items, tier, userId, userEmail, successUrl, cancelUrl } = body;

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
        success_url: successUrl || `${new URL(req.url).origin}/#/profile?payment=success&tier=${encodeURIComponent(tier)}`,
        cancel_url: cancelUrl || `${new URL(req.url).origin}/#/profile?payment=cancelled`
      });

      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });

    } else if (type === 'shop') {
      // Shop one-time purchase checkout
      if (!items || !items.length) {
        return new Response(JSON.stringify({ error: 'No items provided' }), { status: 400 });
      }

      const lineItems = items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description || undefined
          },
          unit_amount: Math.round(item.price * 100) // Convert dollars to cents
        },
        quantity: item.quantity || 1
      }));

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
          itemIds: items.map((i: any) => i.id).join(',')
        },
        line_items: lineItems,
        success_url: successUrl || `${new URL(req.url).origin}/#/profile?payment=success&type=shop`,
        cancel_url: cancelUrl || `${new URL(req.url).origin}/#/shop?payment=cancelled`
      });

      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });

    } else if (type === 'local_pass') {
      const { passName, priceAmount, firstName, lastName } = body;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: userEmail || undefined,
        metadata: {
          type: 'local_pass',
          passName: passName,
          firstName: firstName,
          lastName: lastName
        },
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Local Pass: ${passName}`,
              description: 'Single access pass to the facility'
            },
            unit_amount: Math.round(parseFloat(priceAmount || 0) * 100)
          },
          quantity: 1
        }],
        success_url: successUrl || `${new URL(req.url).origin}/#/pass-success?passId={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${new URL(req.url).origin}/`
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
        success_url: successUrl || `${new URL(req.url).origin}/#/profile?payment=success&type=retreat_deposit`,
        cancel_url: cancelUrl || `${new URL(req.url).origin}/#/profile`
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
