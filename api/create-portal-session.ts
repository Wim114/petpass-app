import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from './_lib/stripe';
import { supabaseAdmin, verifyUser } from './_lib/supabase';
import { handleCors } from './_lib/cors';

const siteUrl = process.env.SITE_URL ?? 'https://petpass.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the caller's JWT
    const user = await verifyUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Look up the user's own stripe_customer_id from their profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    const customerId = profile?.stripe_customer_id;
    if (!customerId) {
      return res.status(400).json({ error: 'No billing account found. Please subscribe to a plan first.' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/dashboard/membership`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error('Error creating portal session:', err);
    return res.status(500).json({ error: 'Failed to create billing portal session' });
  }
}
