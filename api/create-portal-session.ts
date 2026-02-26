import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from './_lib/stripe';
import { handleCors } from './_lib/cors';

const siteUrl = process.env.SITE_URL ?? 'https://petpass.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/dashboard/membership`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error('Error creating portal session:', err);
    return res.status(500).json({ error: (err as Error).message });
  }
}
