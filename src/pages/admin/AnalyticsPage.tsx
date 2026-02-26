import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Spinner } from '@/components/ui/Spinner';
import type { AdminStats } from '@/types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const PLAN_COLORS: Record<string, string> = {
  basic: '#64748b',
  care_plus: '#10b981',
  vip: '#f59e0b',
};

const PLAN_LABELS: Record<string, string> = {
  basic: 'Basic',
  care_plus: 'Care+',
  vip: 'VIP',
};

const fallbackRevenueByMonth = [
  { month: 'Sep', revenue: 980, members: 25 },
  { month: 'Oct', revenue: 1240, members: 32 },
  { month: 'Nov', revenue: 1540, members: 39 },
  { month: 'Dec', revenue: 1720, members: 44 },
  { month: 'Jan', revenue: 1843, members: 47 },
];

const fallbackPlanDistribution = { basic: 18, care_plus: 21, vip: 8 };

const fallbackMemberGrowth = [
  { month: 'Sep', newMembers: 25, churned: 0 },
  { month: 'Oct', newMembers: 9, churned: 2 },
  { month: 'Nov', newMembers: 10, churned: 3 },
  { month: 'Dec', newMembers: 8, churned: 3 },
  { month: 'Jan', newMembers: 7, churned: 4 },
];

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
};

export default function AnalyticsPage() {
  const { t } = useLanguage();

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-stats');
      if (error) throw error;
      return data as AdminStats;
    },
    staleTime: 1000 * 60 * 5,
  });

  const revenueByMonth = stats?.revenueByMonth ?? fallbackRevenueByMonth;
  const planDist = stats?.planDistribution ?? fallbackPlanDistribution;
  const memberGrowth = (stats as any)?.memberGrowth ?? fallbackMemberGrowth;

  const planDistribution = Object.entries(planDist).map(([key, value]) => ({
    name: PLAN_LABELS[key] || key,
    value,
    color: PLAN_COLORS[key] || '#94a3b8',
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>

      {/* Revenue Over Time - Full Width */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-slate-900">Revenue Over Time</h3>
        <p className="mb-6 text-sm text-slate-500">Monthly recurring revenue and member count</p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis
              yAxisId="revenue"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => `\u20AC${v}`}
            />
            <YAxis
              yAxisId="members"
              orientation="right"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="Revenue (\u20AC)"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#10b981' }}
              activeDot={{ r: 7 }}
            />
            <Line
              yAxisId="members"
              type="monotone"
              dataKey="members"
              name="Members"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#6366f1' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Plan Distribution & Member Growth */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-semibold text-slate-900">Plan Distribution</h3>
          <p className="mb-6 text-sm text-slate-500">Current members by subscription plan</p>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-sm text-slate-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Plan breakdown summary */}
          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
            {planDistribution.map((plan) => (
              <div key={plan.name} className="text-center">
                <div
                  className="mx-auto mb-1 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: plan.color }}
                />
                <p className="text-lg font-bold text-slate-900">{plan.value}</p>
                <p className="text-xs text-slate-500">{plan.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Members Growth */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-lg font-semibold text-slate-900">Member Growth</h3>
          <p className="mb-6 text-sm text-slate-500">New members vs churned per month</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={memberGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar
                dataKey="newMembers"
                name="New Members"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="churned"
                name="Churned"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Growth summary */}
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">
                +{memberGrowth.reduce((acc: number, m: any) => acc + m.newMembers, 0)}
              </p>
              <p className="text-xs text-slate-500">Total New Members</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-500">
                -{memberGrowth.reduce((acc: number, m: any) => acc + m.churned, 0)}
              </p>
              <p className="text-xs text-slate-500">Total Churned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
