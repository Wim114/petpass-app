import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
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
  Scale,
  Calendar,
  Heart,
  AlertCircle,
} from 'lucide-react';
import { apiCall } from '@/lib/api';
import type { AdminStats } from '@/types';

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

const PET_TYPE_COLORS: Record<string, string> = {
  dog: '#3b82f6',
  cat: '#f59e0b',
  bird: '#10b981',
  fish: '#6366f1',
  rabbit: '#ec4899',
  other: '#94a3b8',
};

const PET_TYPE_LABELS: Record<string, string> = {
  dog: 'Dogs',
  cat: 'Cats',
  bird: 'Birds',
  fish: 'Fish',
  rabbit: 'Rabbits',
  other: 'Other',
};

const HEALTH_CONDITION_LABELS: Record<string, string> = {
  none: 'Healthy',
  allergies: 'Allergies',
  arthritis: 'Arthritis',
  diabetes: 'Diabetes',
  heart_disease: 'Heart Disease',
  kidney_disease: 'Kidney Disease',
  epilepsy: 'Epilepsy',
  obesity: 'Obesity',
  dental_disease: 'Dental Disease',
  skin_conditions: 'Skin Conditions',
  anxiety: 'Anxiety',
  joint_problems: 'Joint Problems',
  digestive_issues: 'Digestive Issues',
  heart_conditions: 'Heart Conditions',
  dental_problems: 'Dental Problems',
};

const HEALTH_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4',
];

const AGE_LABELS: Record<string, string> = {
  puppy_kitten: 'Puppy/Kitten',
  young: 'Young',
  adult: 'Adult',
  senior: 'Senior',
  unknown: 'Unknown',
};

const AGE_COLORS: Record<string, string> = {
  puppy_kitten: '#3b82f6',
  young: '#10b981',
  adult: '#f59e0b',
  senior: '#ef4444',
  unknown: '#94a3b8',
};

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
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
    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-emerald-50 p-2 sm:p-2.5">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
        </div>
        {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />}
        {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />}
      </div>
      <p className="mt-2 sm:mt-3 text-lg sm:text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs sm:text-sm text-slate-500 truncate">{title}</p>
      {subtitle && <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-400 truncate">{subtitle}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => apiCall<AdminStats>('admin-stats', { method: 'GET' }),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-lg font-semibold text-slate-700">Failed to load dashboard data</p>
        <p className="mt-1 text-sm text-slate-500">
          {(error as Error)?.message || 'Please check your connection and try again.'}
        </p>
      </div>
    );
  }

  const s = stats;

  const pieData = Object.entries(s.planDistribution).map(([key, value]) => ({
    name: PLAN_LABELS[key] || key,
    value,
    color: PLAN_COLORS[key] || '#94a3b8',
  }));

  const petTypeData = Object.entries(s.petTypeDistribution || {}).map(([key, value]) => ({
    name: PET_TYPE_LABELS[key] || key,
    value,
    color: PET_TYPE_COLORS[key] || '#94a3b8',
  }));

  const healthData = Object.entries(s.healthConditionFrequency || {})
    .filter(([key]) => key !== 'none')
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({
      name: HEALTH_CONDITION_LABELS[key] || key,
      value,
    }));

  const ageData = Object.entries(s.ageCategoryDistribution || {}).map(([key, value]) => ({
    name: AGE_LABELS[key] || key,
    value,
    color: AGE_COLORS[key] || '#94a3b8',
  }));

  const weightBucketData = Object.entries(s.weightBuckets || {})
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: key,
      value,
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
          subtitle={`${s.totalUsers} registered users`}
        />
        <KpiCard
          title="MRR"
          value={`\u20AC${s.mrr.toLocaleString()}`}
          icon={Euro}
          trend="up"
          subtitle={`ARR: \u20AC${s.arr.toLocaleString()}`}
        />
        <KpiCard
          title="Churn Rate"
          value={`${s.churnRate}%`}
          icon={Percent}
          trend={s.churnRate > 5 ? 'down' : 'up'}
          subtitle={`Retention: ${s.retentionRate}%`}
        />
        <KpiCard
          title="ARPU"
          value={`\u20AC${s.arpu}`}
          icon={Euro}
          subtitle={`LTV: \u20AC${s.ltv}`}
        />
        <KpiCard
          title="Trial Conversion"
          value={`${s.trialConversionRate}%`}
          icon={UserPlus}
          trend="up"
        />
        <KpiCard
          title="New This Month"
          value={s.newSignupsThisMonth}
          icon={UserPlus}
          trend="up"
        />
        <KpiCard
          title="Total Pets"
          value={s.totalPets}
          icon={PawPrint}
          subtitle={`${s.petsPerUser} per user`}
        />
        <KpiCard
          title="Waitlist Size"
          value={s.waitlistSize}
          icon={ClipboardList}
        />
      </div>

      {/* Charts Row: Revenue + Plan Distribution */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-slate-900">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={s.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `\u20AC${v}`} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue (\u20AC)"
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

        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
          <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-slate-900">Plan Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
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
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pet Statistics Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Pet Intelligence</h2>
        <p className="mb-6 text-sm text-slate-500">Descriptive statistics of all registered pets</p>

        {/* Pet Overview KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-slate-600">Total Pets</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.totalPets}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-slate-600">Pets / User</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.petsPerUser}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-slate-600">Avg. Age</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {s.averagePetAge != null ? `${s.averagePetAge} yr` : 'N/A'}
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-slate-600">Avg. Weight</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {s.averagePetWeight != null ? `${s.averagePetWeight} kg` : 'N/A'}
            </p>
            {s.weightStats && (
              <p className="mt-1 text-xs text-slate-400">
                Range: {s.weightStats.min}–{s.weightStats.max} kg | Median: {s.weightStats.median} kg
              </p>
            )}
          </div>
        </div>

        {/* Pet Charts Row 1: Type + Age Distribution */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Pet Type Distribution */}
          <div className="rounded-lg border border-slate-100 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Pet Type Distribution</h3>
            {petTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={petTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {petTypeData.map((entry, index) => (
                      <Cell key={`pet-type-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">No pet data available</p>
            )}
          </div>

          {/* Age Category Distribution */}
          <div className="rounded-lg border border-slate-100 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Age Distribution</h3>
            {ageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={70} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" name="Pets" radius={[0, 4, 4, 0]}>
                    {ageData.map((entry, index) => (
                      <Cell key={`age-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">No age data available</p>
            )}
          </div>
        </div>

        {/* Pet Charts Row 2: Weight + Health Conditions */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Weight Size Distribution */}
          <div className="rounded-lg border border-slate-100 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Size Distribution (Weight)</h3>
            {weightBucketData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weightBucketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" name="Pets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">No weight data available</p>
            )}
          </div>

          {/* Health Conditions */}
          <div className="rounded-lg border border-slate-100 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-semibold text-slate-700">Health Conditions</h3>
            </div>
            {healthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={healthData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" name="Pets affected" radius={[0, 4, 4, 0]}>
                    {healthData.map((_, index) => (
                      <Cell key={`health-${index}`} fill={HEALTH_COLORS[index % HEALTH_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">No health data available</p>
            )}
          </div>
        </div>

        {/* Top Breeds */}
        {s.topBreeds && s.topBreeds.length > 0 && (
          <div className="rounded-lg border border-slate-100 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Top Breeds</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {s.topBreeds.map((b, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="truncate text-sm text-slate-700">{b.breed}</span>
                  <span className="ml-2 text-sm font-bold text-slate-900">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Signups Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 sm:px-5 py-3 sm:py-4">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Recent Signups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-3 sm:px-5 py-3 font-medium text-slate-500 text-xs sm:text-sm">Email</th>
                <th className="px-3 sm:px-5 py-3 font-medium text-slate-500 text-xs sm:text-sm">Plan</th>
                <th className="px-3 sm:px-5 py-3 font-medium text-slate-500 text-xs sm:text-sm hidden sm:table-cell">District</th>
                <th className="px-3 sm:px-5 py-3 font-medium text-slate-500 text-xs sm:text-sm">Joined</th>
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
                s.recentSignups.map((signup, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 sm:px-5 py-3 text-slate-900 text-xs sm:text-sm max-w-[150px] truncate">{signup.email}</td>
                    <td className="px-3 sm:px-5 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        {PLAN_LABELS[signup.plan] || signup.plan}
                      </span>
                    </td>
                    <td className="px-3 sm:px-5 py-3 text-slate-600 text-xs sm:text-sm hidden sm:table-cell">{signup.district || '-'}</td>
                    <td className="px-3 sm:px-5 py-3 text-slate-500 text-xs sm:text-sm">
                      {signup.created_at
                        ? new Date(signup.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
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
