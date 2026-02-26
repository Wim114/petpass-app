import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
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
import {
  Users,
  Euro,
  TrendingUp,
  TrendingDown,
  UserPlus,
  PawPrint,
  ClipboardList,
  Percent,
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { apiCall } from '@/lib/api';
import type { AdminStats } from '@/types';

const mockStats: AdminStats = {
  totalMembers: 47,
  mrr: 1843,
  arr: 22116,
  churnRate: 3.2,
  retentionRate: 96.8,
  arpu: 39.2,
  ltv: 470.4,
  trialConversionRate: 68,
  newSignupsThisMonth: 12,
  petsPerUser: 1.4,
  waitlistSize: 234,
  planDistribution: { basic: 18, care_plus: 21, vip: 8 },
  revenueByMonth: [
    { month: 'Sep', revenue: 980, members: 25 },
    { month: 'Oct', revenue: 1240, members: 32 },
    { month: 'Nov', revenue: 1540, members: 39 },
    { month: 'Dec', revenue: 1720, members: 44 },
    { month: 'Jan', revenue: 1843, members: 47 },
  ],
  recentSignups: [],
};

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

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

function KpiCard({ title, value, icon: Icon, trend, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-emerald-50 p-2.5">
          <Icon className="h-5 w-5 text-emerald-600" />
        </div>
        {trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
        {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{title}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useLanguage();

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => apiCall<AdminStats>('admin-stats', { method: 'GET' }),
    staleTime: 1000 * 60 * 5,
  });

  const s = stats ?? mockStats;

  const pieData = Object.entries(s.planDistribution).map(([key, value]) => ({
    name: PLAN_LABELS[key] || key,
    value,
    color: PLAN_COLORS[key] || '#94a3b8',
  }));

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Total Members"
          value={s.totalMembers}
          icon={Users}
          trend="up"
        />
        <KpiCard
          title="MRR"
          value={`€${s.mrr.toLocaleString()}`}
          icon={Euro}
          trend="up"
        />
        <KpiCard
          title="ARR"
          value={`€${s.arr.toLocaleString()}`}
          icon={Euro}
          trend="up"
        />
        <KpiCard
          title="Churn Rate"
          value={`${s.churnRate}%`}
          icon={Percent}
          trend="down"
        />
        <KpiCard
          title="Retention Rate"
          value={`${s.retentionRate}%`}
          icon={TrendingUp}
          trend="up"
        />
        <KpiCard
          title="ARPU"
          value={`€${s.arpu}`}
          icon={Euro}
        />
        <KpiCard
          title="LTV"
          value={`€${s.ltv}`}
          icon={Euro}
          trend="up"
        />
        <KpiCard
          title="Trial Conversion"
          value={`${s.trialConversionRate}%`}
          icon={UserPlus}
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Over Time */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={s.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue (€)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="members"
                name="Members"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Plan Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-slate-500">New This Month</span>
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">{s.newSignupsThisMonth}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <PawPrint className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-slate-500">Pets / User</span>
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">{s.petsPerUser}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-slate-500">Waitlist Size</span>
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">{s.waitlistSize}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-slate-500">Total Plans</span>
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {Object.values(s.planDistribution).reduce((a, b) => a + b, 0)}
          </p>
        </div>
      </div>

      {/* Recent Signups Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Signups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 font-medium text-slate-500">Name</th>
                <th className="px-5 py-3 font-medium text-slate-500">Email</th>
                <th className="px-5 py-3 font-medium text-slate-500">Plan</th>
                <th className="px-5 py-3 font-medium text-slate-500">Joined</th>
              </tr>
            </thead>
            <tbody>
              {s.recentSignups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    No recent signups to display.
                  </td>
                </tr>
              ) : (
                s.recentSignups.map((signup: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 text-slate-900">{signup.name}</td>
                    <td className="px-5 py-3 text-slate-600">{signup.email}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        {signup.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{signup.joined}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
