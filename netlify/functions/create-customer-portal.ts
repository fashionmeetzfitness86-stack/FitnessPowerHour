import Stripe from 'stripe';

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

  if (!process.env.STRIPE_API_KEY) {
    console.error('FATAL: STRIPE_API_KEY is not defined in Netlify environment variables');
    return new Response(JSON.stringify({ error: 'STRIPE_API_KEY missing - Platform cannot access billing portal until keys are linked in Netlify.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const stripe = new Stripe(process.env.STRIPE_API_KEY, { apiVersion: '2026-02-25.clover' as any });

  try {
    const body = await req.json();
    const { userEmail, returnUrl } = body;

    if (!userEmail) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    // Attempt to find the Stripe customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No active Stripe subscription found.', 
        code: 'CUSTOMER_NOT_FOUND',
        message: 'You must have an active protocol subscription to access the Billing Portal.' 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const customer = customers.data[0];

    let origin = 'https://fitnesspowerhour.com';
    try { origin = new URL(req.url).origin; } catch(e) { origin = req.headers.get('origin') || origin; }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl || `${origin}/#/profile`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    console.error('Customer Portal Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
