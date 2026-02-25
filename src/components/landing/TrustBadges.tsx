import React from 'react';
import { ShieldCheck, CreditCard, Star } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const TrustBadges: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-up">
      <div className="flex flex-col items-center text-center gap-3 p-6">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
        </div>
        <h4 className="font-bold text-slate-900">{t.trust.guarantee}</h4>
        <p className="text-sm text-slate-500">{t.trust.guaranteeDesc}</p>
      </div>
      <div className="flex flex-col items-center text-center gap-3 p-6">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <CreditCard className="w-7 h-7 text-emerald-600" />
        </div>
        <h4 className="font-bold text-slate-900">{t.trust.noCommitment}</h4>
        <p className="text-sm text-slate-500">{t.trust.noCommitmentDesc}</p>
      </div>
      <div className="flex flex-col items-center text-center gap-3 p-6">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
          <Star className="w-7 h-7 text-emerald-600" />
        </div>
        <h4 className="font-bold text-slate-900">{t.trust.freeMonth}</h4>
        <p className="text-sm text-slate-500">{t.trust.freeMonthDesc}</p>
      </div>
    </div>
  );
};

export default TrustBadges;
