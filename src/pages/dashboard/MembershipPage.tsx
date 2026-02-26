import { useQuery } from '@tanstack/react-query';
import {
  Crown,
  Check,
  ExternalLink,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { Spinner } from '@/components/ui/Spinner';
import type { Subscription, Payment } from '@/types';

const PLAN_FEATURES: Record<string, string[]> = {
  basic: [
    'Up to 3 pet profiles',
    'Digital member card with QR',
    'Priority support',
    'Partner discounts (5%)',
    'Monthly newsletter',
  ],
  care_plus: [
    'Up to 5 pet profiles',
    'Digital member card with QR',
    '24/7 priority support',
    'Partner discounts (10%)',
    'Vet consultation credits',
    'Monthly newsletter',
  ],
  vip: [
    'Unlimited pet profiles',
    'Premium member card with QR',
    '24/7 priority support',
    'Partner discounts (15%)',
    'Vet consultation credits',
    'Pet insurance discounts',
    'Exclusive events access',
  ],
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  trialing: 'bg-blue-100 text-blue-700',
  canceled: 'bg-red-100 text-red-700',
  past_due: 'bg-amber-100 text-amber-700',
  unpaid: 'bg-red-100 text-red-700',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-700',
};

export default function MembershipPage() {
  const { t } = useLanguage();
  const { user } = useAuthStore();

  const { data: subscription, isLoading: subLoading } =
    useQuery<Subscription | null>({
      queryKey: ['subscription', user?.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      enabled: !!user?.id,
    });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<
    Payment[]
  >({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const isLoading = subLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const planType = subscription?.plan || null;
  const features = planType ? (PLAN_FEATURES[planType] || PLAN_FEATURES.basic) : [];

  const handleManageBilling = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-portal-session',
        {
          body: { return_url: window.location.href },
        }
      );
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      // Silently handle error - user can retry
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {t.membership?.title ?? 'Membership'}
        </h1>
        <p className="text-slate-500 mt-1">
          {t.membership?.subtitle ?? 'Manage your subscription and billing'}
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {t.membership?.currentPlan ?? 'Current Plan'}
              </h2>
              <p className="text-2xl font-bold text-emerald-600 capitalize">
                {planType || 'Free'}
              </p>
            </div>
          </div>
          {subscription && (
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
                STATUS_STYLES[subscription.status] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {subscription.status}
            </span>
          )}
        </div>

        {subscription?.current_period_end && (
          <p className="text-sm text-slate-500 mb-4">
            {subscription.status === 'canceled'
              ? t.membership?.expiresOn ?? 'Expires on'
              : t.membership?.renewsOn ?? 'Renews on'}{' '}
            {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}
          </p>
        )}

        <div className="space-y-2 mb-6">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-slate-600">{feature}</span>
            </div>
          ))}
        </div>

        {subscription ? (
          <button
            onClick={handleManageBilling}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition"
          >
            <ExternalLink className="w-4 h-4" />
            {t.membership?.manageBilling ?? 'Manage Billing'}
          </button>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {t.membership?.noActivePlan ?? 'No active subscription'}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {t.membership?.upgradePrompt ??
                  'Upgrade to unlock more features for your pets.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Receipt className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">
            {t.membership?.billingHistory ?? 'Billing History'}
          </h2>
        </div>

        {payments.length === 0 ? (
          <p className="text-slate-500 text-sm">
            {t.membership?.noPayments ?? 'No payment history yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-medium text-slate-600">
                    {t.membership?.date ?? 'Date'}
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600">
                    {t.membership?.description ?? 'Description'}
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600">
                    {t.membership?.amount ?? 'Amount'}
                  </th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600">
                    {t.membership?.status ?? 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-3 px-2 text-slate-700">
                      {format(new Date(payment.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-2 text-slate-700">
                      {planType ? `${planType} plan` : 'Subscription'}
                    </td>
                    <td className="py-3 px-2 text-slate-700 font-medium">
                      {(payment.amount_cents / 100).toFixed(2)}{' '}
                      {payment.currency?.toUpperCase() || 'EUR'}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          PAYMENT_STATUS_STYLES[payment.status] ||
                          'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
