import React from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface WaitlistSectionProps {
  onOpenModal: () => void;
}

const WaitlistSection: React.FC<WaitlistSectionProps> = ({ onOpenModal }) => {
  const { t } = useLanguage();

  return (
    <section id="waitlist" className="py-12 sm:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-600 rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 md:p-12 lg:p-20 relative overflow-hidden text-center text-white shadow-2xl shadow-emerald-200">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5 sm:space-y-8">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm tracking-widest uppercase">
              {t.waitlist.badge}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
              {t.waitlist.title}
            </h2>
            <p className="text-base sm:text-xl text-emerald-100">
              {t.waitlist.subtitle} <strong className="text-white underline underline-offset-4">{t.waitlist.freeMonth}</strong>
            </p>
            <button
              onClick={onOpenModal}
              className="bg-white text-emerald-600 px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl hover:bg-emerald-50 transition-all shadow-xl inline-flex items-center gap-2 group"
            >
              {t.waitlist.joinButton}
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-white/20">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-current shrink-0" />
                <p className="text-sm sm:text-lg font-bold">
                  {t.waitlist.referral} <span className="text-amber-300">{t.waitlist.referralBonus}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;
