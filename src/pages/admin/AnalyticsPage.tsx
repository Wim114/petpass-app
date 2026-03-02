import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/lib/api';
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
import {
  AlertCircle,
  PawPrint,
  Heart,
} from 'lucide-react';

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
  '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899',
  '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#10b981',
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

export default function AnalyticsPage() {
  const { data: stats, isLoading, error } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => apiCall<AdminStats>('admin-stats', { method: 'GET' }),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-lg font-semibold text-slate-700">Failed to load analytics</p>
        <p className="mt-1 text-sm text-slate-500">
          {(error as Error)?.message || 'Please check your connection and try again.'}
        </p>
      </div>
    );
  }

  const revenueByMonth = stats.revenueByMonth;
  const memberGrowth = stats.memberGrowth;
  const planDist = stats.planDistribution;

  const planDistribution = Object.entries(planDist).map(([key, value]) => ({
    name: PLAN_LABELS[key] || key,
    value,
    color: PLAN_COLORS[key] || '#94a3b8',
  }));

  const petTypeData = Object.entries(stats.petTypeDistribution || {}).map(([key, value]) => ({
    name: PET_TYPE_LABELS[key] || key,
    value,
    color: PET_TYPE_COLORS[key] || '#94a3b8',
  }));

  const healthData = Object.entries(stats.healthConditionFrequency || {})
    .filter(([key]) => key !== 'none')
    .sort(([, a], [, b]) => b - a);

  const healthyCount = stats.healthConditionFrequency?.['none'] ?? 0;
  const totalPetsWithConditions = Object.entries(stats.healthConditionFrequency || {})
    .filter(([key]) => key !== 'none')
    .reduce((sum, [, count]) => sum + count, 0);

  const ageData = Object.entries(stats.ageCategoryDistribution || {}).map(([key, value]) => ({
    name: AGE_LABELS[key] || key,
    value,
    color: AGE_COLORS[key] || '#94a3b8',
  }));

  const weightBucketData = Object.entries(stats.weightBuckets || {})
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: key,
      value,
    }));

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

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">
                +{memberGrowth.reduce((acc, m) => acc + m.newMembers, 0)}
              </p>
              <p className="text-xs text-slate-500">Total New Members</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-500">
                -{memberGrowth.reduce((acc, m) => acc + m.churned, 0)}
              </p>
              <p className="text-xs text-slate-500">Total Churned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pet Analytics Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-900">Pet Analytics</h3>
        </div>

        {/* Pet Type + Age Category */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-100 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">Pet Type Breakdown</h4>
            {petTypeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={petTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {petTypeData.map((entry, index) => (
                        <Cell key={`pet-type-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                  {petTypeData.map((p) => (
                    <div key={p.name} className="text-center">
                      <div className="mx-auto mb-1 h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <p className="text-sm font-bold text-slate-900">{p.value}</p>
                      <p className="text-xs text-slate-500">{p.name}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-12 text-center text-sm text-slate-400">No pet data available</p>
            )}
          </div>

          <div className="rounded-lg border border-slate-100 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">Age Distribution</h4>
            {ageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" name="Pets" radius={[4, 4, 0, 0]}>
                    {ageData.map((entry, index) => (
                      <Cell key={`age-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-slate-400">No age data available</p>
            )}
          </div>
        </div>

        {/* Weight + Health Conditions */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-100 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">Weight Distribution</h4>
            {stats.weightStats && (
              <div className="mb-4 grid grid-cols-4 gap-2">
                {[
                  { label: 'Min', value: `${stats.weightStats.min} kg` },
                  { label: 'Median', value: `${stats.weightStats.median} kg` },
                  { label: 'Mean', value: `${stats.weightStats.mean} kg` },
                  { label: 'Max', value: `${stats.weightStats.max} kg` },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-md bg-slate-50 px-2 py-1.5 text-center">
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="text-sm font-bold text-slate-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}
            {weightBucketData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weightBucketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" name="Pets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-slate-400">No weight data available</p>
            )}
          </div>

          <div className="rounded-lg border border-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <h4 className="text-sm font-semibold text-slate-700">Health Conditions</h4>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-emerald-600">{healthyCount} healthy</span>
                <span className="text-red-500">{totalPetsWithConditions} with conditions</span>
              </div>
            </div>
            {healthData.length > 0 ? (
              <div className="space-y-2">
                {healthData.map(([key, count], index) => {
                  const total = stats.totalPets || 1;
                  const pct = ((count / total) * 100).toFixed(1);
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-28 truncate text-xs text-slate-600">
                        {HEALTH_CONDITION_LABELS[key] || key}
                      </span>
                      <div className="flex-1">
                        <div className="h-5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="flex h-full items-center rounded-full px-2 text-xs font-medium text-white"
                            style={{
                              width: `${Math.max(Number(pct), 8)}%`,
                              backgroundColor: HEALTH_COLORS[index % HEALTH_COLORS.length],
                            }}
                          >
                            {count}
                          </div>
                        </div>
                      </div>
                      <span className="w-12 text-right text-xs text-slate-500">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-slate-400">No health data available</p>
            )}
          </div>
        </div>

        {/* Top Breeds */}
        {stats.topBreeds && stats.topBreeds.length > 0 && (
          <div className="rounded-lg border border-slate-100 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-700">Top Breeds</h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {stats.topBreeds.map((b, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="truncate text-sm text-slate-700">{b.breed}</span>
                  <span className="ml-2 text-sm font-bold text-slate-900">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
