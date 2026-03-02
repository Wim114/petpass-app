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

    // Try to read dynamic plan prices from site_config (table may not exist)
    const dynamicPrices = { ...PLAN_PRICES };
    try {
      const { data: planConfigRows } = await supabaseAdmin
        .from('site_config')
        .select('value')
        .eq('key', 'plan_config')
        .single();

      if (planConfigRows?.value?.plans) {
        for (const plan of planConfigRows.value.plans) {
          if (plan.key && plan.price != null) {
            dynamicPrices[plan.key] = plan.price;
          }
        }
      }
    } catch {
      // site_config table may not exist yet — use hardcoded defaults
    }

    // --- Fetch raw data (each query handled individually) ---

    const results = await Promise.allSettled([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('pets').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('pets').select('birthday, weight_kg'),
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

    const settled = (i: number) =>
      results[i].status === 'fulfilled' ? results[i].value : { data: null, count: null };

    const totalUsers = settled(0).count ?? 0;
    const totalPets = settled(1).count ?? 0;
    const allPets = settled(2).data ?? [];
    const allSubs = settled(3).data ?? [];
    const allPayments = settled(4).data ?? [];
    const waitlistCount = settled(5).count ?? 0;

    // --- Compute KPIs ---

    const activeSubs = allSubs.filter(
      (s: any) => s.status === 'active' || s.status === 'trialing'
    );
    const cancelledSubs = allSubs.filter((s: any) => s.status === 'cancelled');
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
      (sum: number, sub: any) => sum + (dynamicPrices[sub.plan] ?? 0),
      0
    );
    const arr = mrr * 12;

    // Churn & retention
    const totalEver = allSubs.length || 1;
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
    const trialingSubs = allSubs.filter((s: any) => s.status === 'trialing');
    const convertedFromTrial = allSubs.filter((s: any) => s.status === 'active');
    const trialPool = trialingSubs.length + convertedFromTrial.length;
    const trialConversionRate = trialPool > 0
      ? Number(((convertedFromTrial.length / trialPool) * 100).toFixed(0))
      : 0;

    // New signups this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const newSignupsThisMonth = allSubs.filter(
      (s: any) => s.created_at >= startOfMonth
    ).length;

    // Pets per user
    const petsPerUser = totalUsers > 0
      ? Number((totalPets / totalUsers).toFixed(1))
      : 0;

    // Pet age and weight averages
    const petBirthdays = allPets
      .filter((p: any) => p.birthday)
      .map((p: any) => {
        const birth = new Date(p.birthday);
        const ageYears = (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        return ageYears;
      });
    const averagePetAge = petBirthdays.length > 0
      ? Number((petBirthdays.reduce((a: number, b: number) => a + b, 0) / petBirthdays.length).toFixed(1))
      : null;

    const petWeights = allPets
      .filter((p: any) => p.weight_kg != null)
      .map((p: any) => Number(p.weight_kg));
    const averagePetWeight = petWeights.length > 0
      ? Number((petWeights.reduce((a: number, b: number) => a + b, 0) / petWeights.length).toFixed(1))
      : null;

    // Revenue by month (last 5 months)
    const revenueByMonth: Array<{ month: string; revenue: number; members: number }> = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = d.toISOString();
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

      const monthRevenue = allPayments
        .filter((p: any) => p.created_at >= monthStart && p.created_at < nextMonth)
        .reduce((sum: number, p: any) => sum + (p.amount_cents ?? 0), 0);

      const monthMembers = allSubs.filter(
        (s: any) =>
          s.created_at < nextMonth &&
          (s.status === 'active' || s.status === 'trialing')
      ).length;

      revenueByMonth.push({
        month: monthNames[d.getMonth()],
        revenue: Math.round(monthRevenue / 100),
        members: monthMembers,
      });
    }

    // Recent signups (join with subscription info — wrapped in try-catch)
    let recentSignups: Array<{ email: string; plan: string; district: string; created_at: string }> = [];
    try {
      const { data: recentSignupRows } = await supabaseAdmin
        .from('profiles')
        .select('email, created_at, subscriptions(plan)')
        .order('created_at', { ascending: false })
        .limit(10);

      recentSignups = (recentSignupRows ?? []).map((row: any) => ({
        email: row.email,
        plan: row.subscriptions?.[0]?.plan ?? 'waitlist',
        district: '',
        created_at: row.created_at,
      }));
    } catch {
      // Embedded query may fail — return empty signups list
    }

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
      totalPets,
      averagePetAge,
      averagePetWeight,
      waitlistSize: waitlistCount,
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
