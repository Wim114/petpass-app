import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, verifyUser } from './_lib/supabase';
import { handleCors } from './_lib/cors';

interface AdminStats {
  totalUsers: number;
  totalPets: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  cancelledSubscriptions: number;
  subscriptionsByPlan: Record<string, number>;
  totalRevenueCents: number;
  monthlyRevenueCents: number;
  waitlistCount: number;
  referralCount: number;
  convertedReferrals: number;
  usersByRole: Record<string, number>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the caller's JWT
    const user = await verifyUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin role required' });
    }

    // Aggregate stats using the service role client (bypasses RLS)

    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalPets } = await supabaseAdmin
      .from('pets')
      .select('*', { count: 'exact', head: true });

    const { data: allSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('status, plan');

    const activeSubscriptions = allSubs?.filter((s) => s.status === 'active').length ?? 0;
    const trialingSubscriptions = allSubs?.filter((s) => s.status === 'trialing').length ?? 0;
    const cancelledSubscriptions = allSubs?.filter((s) => s.status === 'cancelled').length ?? 0;

    const subscriptionsByPlan: Record<string, number> = {};
    for (const sub of allSubs ?? []) {
      if (sub.status === 'active' || sub.status === 'trialing') {
        subscriptionsByPlan[sub.plan] = (subscriptionsByPlan[sub.plan] ?? 0) + 1;
      }
    }

    const { data: allPayments } = await supabaseAdmin
      .from('payments')
      .select('amount_cents, currency, status, created_at')
      .eq('status', 'paid');

    const totalRevenueCents =
      allPayments?.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0) ?? 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthlyRevenueCents =
      allPayments
        ?.filter((p) => p.created_at >= startOfMonth)
        .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0) ?? 0;

    const { count: waitlistCount } = await supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    const { data: allReferrals } = await supabaseAdmin
      .from('referrals')
      .select('status');

    const referralCount = allReferrals?.length ?? 0;
    const convertedReferrals =
      allReferrals?.filter((r) => r.status === 'converted' || r.status === 'rewarded').length ?? 0;

    const { data: allProfiles } = await supabaseAdmin.from('profiles').select('role');

    const usersByRole: Record<string, number> = {};
    for (const p of allProfiles ?? []) {
      const role = p.role ?? 'member';
      usersByRole[role] = (usersByRole[role] ?? 0) + 1;
    }

    const stats: AdminStats = {
      totalUsers: totalUsers ?? 0,
      totalPets: totalPets ?? 0,
      activeSubscriptions,
      trialingSubscriptions,
      cancelledSubscriptions,
      subscriptionsByPlan,
      totalRevenueCents,
      monthlyRevenueCents,
      waitlistCount: waitlistCount ?? 0,
      referralCount,
      convertedReferrals,
      usersByRole,
    };

    return res.status(200).json(stats);
  } catch (err) {
    console.error('Error computing admin stats:', err);
    return res.status(500).json({ error: (err as Error).message });
  }
}
