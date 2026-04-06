import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, { apiVersion: '2026-02-25.clover' });

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
      return new Response(JSON.stringify({ error: 'No active Stripe subscription found for this email. Contact support.' }), { status: 404 });
    }

    const customer = customers.data[0];

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl || `${new URL(req.url).origin}/#/profile`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    console.error('Customer Portal Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
