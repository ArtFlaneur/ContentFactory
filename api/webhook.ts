import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Note: These keys must be set in Vercel Environment Variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia', // Use latest API version
});

// We need the SERVICE_ROLE_KEY to bypass RLS and update user profiles from the server
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Disable body parsing, we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!sig || !webhookSecret) throw new Error('Missing signature or secret');
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;

    if (userId) {
      console.log(`Payment successful for user: ${userId}`);
      
      // Update user profile in Supabase
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ 
            is_pro: true,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Supabase update failed:', error);
        res.status(500).send('Database update failed');
        return;
      }
      console.log(`User ${userId} upgraded to Pro.`);
    } else {
        console.warn('No client_reference_id found in session.');
    }
  }

  res.status(200).json({ received: true });
}
