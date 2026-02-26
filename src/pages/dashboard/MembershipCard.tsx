import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { Crown, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { Spinner } from '@/components/ui/Spinner';
import type { Subscription } from '@/types';

export default function MembershipCard() {
  const { t } = useLanguage();
  const { user, profile } = useAuthStore();

  const { data: subscription, isLoading } = useQuery<Subscription | null>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const memberName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : user?.email || '';

  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), 'MMMM yyyy')
    : '';

  const qrData = JSON.stringify({
    member_id: user?.id,
    plan: subscription?.plan || 'free',
    status: subscription?.status || 'none',
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {t.card?.title ?? 'Membership Card'}
        </h1>
        <p className="text-slate-500 mt-1">
          {t.card?.subtitle ?? 'Your digital PetPass card'}
        </p>
      </div>

      {!subscription ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {t.card?.noSubscription ?? 'No Active Subscription'}
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {t.card?.noSubscriptionDesc ??
              'You need an active subscription to access your digital membership card. Upgrade your plan to get started.'}
          </p>
        </div>
      ) : (
        <div className="flex justify-center">
          {/* Card Container */}
          <div className="w-full max-w-md">
            <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-800 p-6 text-white aspect-[1.6/1]">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 400 250">
                  <circle cx="350" cy="30" r="100" fill="white" />
                  <circle cx="50" cy="220" r="80" fill="white" />
                </svg>
              </div>

              {/* Card Content */}
              <div className="relative h-full flex flex-col justify-between">
                {/* Top: Logo & Plan */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-wide">PetPass</h2>
                    <p className="text-emerald-200 text-xs mt-0.5">
                      {t.card?.memberCard ?? 'Member Card'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Crown className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold uppercase">
                      {subscription.plan}
                    </span>
                  </div>
                </div>

                {/* Bottom: Member Info & QR */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg font-semibold">{memberName}</p>
                    {memberSince && (
                      <p className="text-emerald-200 text-xs">
                        {t.card?.memberSince ?? 'Member since'} {memberSince}
                      </p>
                    )}
                  </div>
                  <div className="bg-white p-2 rounded-lg">
                    <QRCodeSVG
                      value={qrData}
                      size={64}
                      bgColor="#ffffff"
                      fgColor="#1e293b"
                      level="M"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Details */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {t.card?.memberId ?? 'Member ID'}
                </span>
                <span className="font-mono text-slate-800 text-xs">
                  {user?.id?.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {t.card?.plan ?? 'Plan'}
                </span>
                <span className="font-semibold text-slate-800 capitalize">
                  {subscription.plan}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {t.card?.status ?? 'Status'}
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full uppercase">
                  {subscription.status}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    {t.card?.validUntil ?? 'Valid Until'}
                  </span>
                  <span className="text-slate-800">
                    {format(
                      new Date(subscription.current_period_end),
                      'MMM d, yyyy'
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
