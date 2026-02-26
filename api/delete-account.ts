import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe } from './_lib/stripe';
import { supabaseAdmin, verifyUser } from './_lib/supabase';
import { handleCors } from './_lib/cors';

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

    const userId = user.id;

    // Fetch profile to check for Stripe customer
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    // Cancel active Stripe subscriptions if customer exists
    if (profile?.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
        });
        for (const sub of subscriptions.data) {
          await stripe.subscriptions.cancel(sub.id);
        }

        // Also cancel trialing subscriptions
        const trialingSubs = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'trialing',
        });
        for (const sub of trialingSubs.data) {
          await stripe.subscriptions.cancel(sub.id);
        }
      } catch (stripeErr) {
        console.error('Error cancelling Stripe subscriptions:', stripeErr);
        // Continue with account deletion even if Stripe cleanup fails
      }
    }

    // Delete user data from Supabase tables (order matters for foreign keys)
    await supabaseAdmin.from('payments').delete().eq('user_id', userId);
    await supabaseAdmin.from('subscriptions').delete().eq('user_id', userId);
    await supabaseAdmin.from('pets').delete().eq('owner_id', userId);
    await supabaseAdmin.from('referrals').delete().eq('referrer_id', userId);
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // Delete the auth user using admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Error deleting auth user:', authError);
      return res.status(500).json({ error: 'Failed to delete auth user' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error deleting account:', err);
    return res.status(500).json({ error: (err as Error).message });
  }
}
