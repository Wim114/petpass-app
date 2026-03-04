import React from 'react';
import { ShieldCheck, CreditCard, Star } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const TrustBadges: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="mt-8 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto animate-fade-up">
      <div className="flex flex-col items-center text-center gap-2 sm:gap-3 p-4 sm:p-6">
        <div className="w-11 h-11 sm:w-14 sm:h-14 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600" />
        </div>
        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{t.trust.guarantee}</h4>
        <p className="text-xs sm:text-sm text-slate-500">{t.trust.guaranteeDesc}</p>
      </div>
      <div className="flex flex-col items-center text-center gap-2 sm:gap-3 p-4 sm:p-6">
        <div className="w-11 h-11 sm:w-14 sm:h-14 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
          <CreditCard className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600" />
        </div>
        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{t.trust.noCommitment}</h4>
        <p className="text-xs sm:text-sm text-slate-500">{t.trust.noCommitmentDesc}</p>
      </div>
      <div className="flex flex-col items-center text-center gap-2 sm:gap-3 p-4 sm:p-6">
        <div className="w-11 h-11 sm:w-14 sm:h-14 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
          <Star className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600" />
        </div>
        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{t.trust.freeMonth}</h4>
        <p className="text-xs sm:text-sm text-slate-500">{t.trust.freeMonthDesc}</p>
      </div>
    </div>
  );
};

export default TrustBadges;
