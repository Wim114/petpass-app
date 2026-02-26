import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { stripe } from './_lib/stripe';
import { supabaseAdmin } from './_lib/supabase';

// Disable Vercel's default body parsing so we can access the raw body
// for Stripe signature verification
export const config = {
  api: { bodyParser: false },
};

function planFromPriceId(priceId: string): string {
  const priceMap: Record<string, string> = {
    [process.env.STRIPE_PRICE_BASIC ?? '']: 'basic',
    [process.env.STRIPE_PRICE_CARE_PLUS ?? '']: 'care_plus',
    [process.env.STRIPE_PRICE_VIP ?? '']: 'vip',
  };
  return priceMap[priceId] ?? 'basic';
}

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('No profile found for Stripe customer:', customerId);
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id ?? '';

  const { error } = await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: profile.id,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      plan: planFromPriceId(priceId),
      status: subscription.status === 'trialing' ? 'trialing' : 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    },
    { onConflict: 'stripe_subscription_id' }
  );

  if (error) {
    console.error('Error upserting subscription:', error);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('No profile found for Stripe customer:', customerId);
    return;
  }

  let subscriptionUuid: string | null = null;
  if (subscriptionId) {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();
    subscriptionUuid = sub?.id ?? null;
  }

  const { error } = await supabaseAdmin.from('payments').insert({
    user_id: profile.id,
    subscription_id: subscriptionUuid,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: (invoice.payment_intent as string) ?? null,
    amount_cents: invoice.amount_paid,
    currency: invoice.currency,
    status: 'paid',
    invoice_url: invoice.hosted_invoice_url ?? null,
  });

  if (error) {
    console.error('Error inserting payment:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id ?? '';

  const statusMap: Record<string, string> = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'unpaid',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete',
  };

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      stripe_price_id: priceId,
      plan: planFromPriceId(priceId),
      status: statusMap[subscription.status] ?? subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error cancelling subscription:', error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(400).json({ error: (err as Error).message });
  }
}
