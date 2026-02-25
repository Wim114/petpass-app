import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gift, Copy, Check, Share2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/i18n/LanguageContext';
import { Spinner } from '@/components/ui/Spinner';
import type { Referral } from '@/types';

const REFERRAL_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  rewarded: 'bg-blue-100 text-blue-700',
  expired: 'bg-slate-100 text-slate-600',
};

export default function ReferralWidget() {
  const { t } = useLanguage();
  const { profile, user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const { data: referrals = [], isLoading } = useQuery<Referral[]>({
    queryKey: ['referrals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const referralCode = profile?.referral_code || '';
  const shareUrl = `${window.location.origin}/signup?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = referralCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PetPass',
          text:
            t.referral?.shareText ??
            'Join PetPass with my referral code and get a special discount!',
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Gift className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">
            {t.referral?.title ?? 'Refer a Friend'}
          </h3>
          <p className="text-xs text-slate-500">
            {t.referral?.subtitle ??
              'Share your code and earn rewards'}
          </p>
        </div>
      </div>

      {/* Referral Code */}
      {referralCode ? (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            {t.referral?.yourCode ?? 'Your Referral Code'}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-mono text-sm text-slate-800 tracking-wider">
              {referralCode}
            </div>
            <button
              onClick={handleCopy}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
              title={t.referral?.copy ?? 'Copy code'}
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              title={t.referral?.share ?? 'Share link'}
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          {copied && (
            <p className="text-xs text-emerald-600 mt-1">
              {t.referral?.copied ?? 'Copied to clipboard!'}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          {t.referral?.noCode ??
            'Your referral code will be available once your profile is set up.'}
        </p>
      )}

      {/* Share Link */}
      {referralCode && (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            {t.referral?.shareLink ?? 'Share Link'}
          </label>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-600 break-all">
            {shareUrl}
          </div>
        </div>
      )}

      {/* Referral List */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-slate-500" />
          <h4 className="text-sm font-semibold text-slate-700">
            {t.referral?.yourReferrals ?? 'Your Referrals'}
            {referrals.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                {referrals.length}
              </span>
            )}
          </h4>
        </div>

        {referrals.length === 0 ? (
          <p className="text-sm text-slate-500">
            {t.referral?.noReferrals ??
              "No referrals yet. Share your code to start earning rewards!"}
          </p>
        ) : (
          <div className="space-y-2">
            {referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {referral.referred_email || t.referral?.anonymous ?? 'Anonymous'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(referral.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    REFERRAL_STATUS_STYLES[referral.status] ||
                    'bg-slate-100 text-slate-600'
                  }`}
                >
                  {referral.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
