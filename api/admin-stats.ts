import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, verifyUser } from './_lib/supabase';
import { handleCors } from './_lib/cors';

const PLAN_PRICES: Record<string, number> = {
  basic: 16,
  care_plus: 39,
  vip: 99,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await verifyUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin role required' });
    }

    // Try to read dynamic plan prices from site_config
    const { data: planConfigRows } = await supabaseAdmin
      .from('site_config')
      .select('value')
      .eq('key', 'plan_config')
      .single();

    const dynamicPrices = { ...PLAN_PRICES };
    if (planConfigRows?.value?.plans) {
      for (const plan of planConfigRows.value.plans) {
        if (plan.key && plan.price != null) {
          dynamicPrices[plan.key] = plan.price;
        }
      }
    }

    // --- Fetch raw data ---

    const [
      { count: totalUsers },
      { count: totalPets },
      { data: allSubs },
      { data: allPayments },
      { count: waitlistCount },
      { data: recentProfiles },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('pets').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('subscriptions').select('status, plan, created_at'),
      supabaseAdmin
        .from('payments')
        .select('amount_cents, currency, status, created_at')
        .eq('status', 'paid'),
      supabaseAdmin.from('waitlist').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('profiles')
        .select('email, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    // --- Compute KPIs ---

    const activeSubs = allSubs?.filter(
      (s) => s.status === 'active' || s.status === 'trialing'
    ) ?? [];
    const cancelledSubs = allSubs?.filter((s) => s.status === 'cancelled') ?? [];
    const totalMembers = activeSubs.length;

    // Plan distribution
    const planDistribution = { basic: 0, care_plus: 0, vip: 0 };
    for (const sub of activeSubs) {
      if (sub.plan in planDistribution) {
        planDistribution[sub.plan as keyof typeof planDistribution] += 1;
      }
    }

    // MRR: sum of each active member's plan price
    const mrr = activeSubs.reduce(
      (sum, sub) => sum + (dynamicPrices[sub.plan] ?? 0),
      0
    );
    const arr = mrr * 12;

    // Churn & retention
    const totalEver = (allSubs?.length ?? 0) || 1;
    const churnRate = totalEver > 0
      ? Number(((cancelledSubs.length / totalEver) * 100).toFixed(1))
      : 0;
    const retentionRate = Number((100 - churnRate).toFixed(1));

    // ARPU & LTV
    const arpu = totalMembers > 0
      ? Number((mrr / totalMembers).toFixed(1))
      : 0;
    const avgLifetimeMonths = churnRate > 0 ? 100 / churnRate : 12;
    const ltv = Number((arpu * avgLifetimeMonths).toFixed(1));

    // Trial conversion
    const trialingSubs = allSubs?.filter((s) => s.status === 'trialing') ?? [];
    const convertedFromTrial = allSubs?.filter((s) => s.status === 'active') ?? [];
    const trialPool = trialingSubs.length + convertedFromTrial.length;
    const trialConversionRate = trialPool > 0
      ? Number(((convertedFromTrial.length / trialPool) * 100).toFixed(0))
      : 0;

    // New signups this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const newSignupsThisMonth = allSubs?.filter(
      (s) => s.created_at >= startOfMonth
    ).length ?? 0;

    // Pets per user
    const petsPerUser = (totalUsers ?? 0) > 0
      ? Number(((totalPets ?? 0) / (totalUsers ?? 1)).toFixed(1))
      : 0;

    // Revenue by month (last 6 months)
    const revenueByMonth: Array<{ month: string; revenue: number; members: number }> = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = d.toISOString();
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

      const monthRevenue = allPayments
        ?.filter((p) => p.created_at >= monthStart && p.created_at < nextMonth)
        .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0) ?? 0;

      const monthMembers = allSubs?.filter(
        (s) =>
          s.created_at < nextMonth &&
          (s.status === 'active' || s.status === 'trialing')
      ).length ?? 0;

      revenueByMonth.push({
        month: monthNames[d.getMonth()],
        revenue: Math.round(monthRevenue / 100),
        members: monthMembers,
      });
    }

    // Recent signups (join with subscription info)
    const { data: recentSignupRows } = await supabaseAdmin
      .from('profiles')
      .select('email, created_at, subscriptions(plan)')
      .order('created_at', { ascending: false })
      .limit(10);

    const recentSignups = (recentSignupRows ?? []).map((row: any) => ({
      email: row.email,
      plan: row.subscriptions?.[0]?.plan ?? 'waitlist',
      district: '',
      created_at: row.created_at,
    }));

    const stats = {
      totalMembers,
      mrr,
      arr,
      churnRate,
      retentionRate,
      arpu,
      ltv,
      trialConversionRate,
      newSignupsThisMonth,
      petsPerUser,
      waitlistSize: waitlistCount ?? 0,
      planDistribution,
      revenueByMonth,
      recentSignups,
    };

    return res.status(200).json(stats);
  } catch (err) {
    console.error('Error computing admin stats:', err);
    return res.status(500).json({ error: (err as Error).message });
  }
}
