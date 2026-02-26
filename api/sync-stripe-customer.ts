import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from './_lib/stripe';
import { supabaseAdmin } from './_lib/supabase';
import { handleCors } from './_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email, name } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    // Check if the user already has a Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // If the user already has a Stripe customer, return it
    if (profile.stripe_customer_id) {
      return res.status(200).json({
        customerId: profile.stripe_customer_id,
        created: false,
      });
    }

    // Create a new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: name ?? undefined,
      metadata: { supabase_user_id: userId },
    });

    // Update the profile with the new Stripe customer ID
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile with Stripe customer ID:', updateError);
      return res.status(500).json({ error: 'Failed to update profile with Stripe customer ID' });
    }

    return res.status(200).json({
      customerId: customer.id,
      created: true,
    });
  } catch (err) {
    console.error('Error syncing Stripe customer:', err);
    return res.status(500).json({ error: (err as Error).message });
  }
}
