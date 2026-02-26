import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from './_lib/stripe';
import { supabaseAdmin } from './_lib/supabase';
import { handleCors } from './_lib/cors';

const siteUrl = process.env.SITE_URL ?? 'https://petpass.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId } = req.body;

    if (!priceId || !userId) {
      return res.status(400).json({ error: 'priceId and userId are required' });
    }

    // Fetch user profile to get or create Stripe customer
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, stripe_customer_id, first_name, last_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    let customerId = profile.stripe_customer_id;

    // Create Stripe customer if none exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email ?? undefined,
        name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || undefined,
        metadata: { supabase_user_id: userId },
      });

      customerId = customer.id;

      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create Checkout Session with 30-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 30 },
      success_url: `${siteUrl}/dashboard/membership?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${siteUrl}/dashboard/membership?cancelled=true`,
      metadata: { supabase_user_id: userId },
    });

    return res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return res.status(500).json({ error: (err as Error).message });
  }
}
