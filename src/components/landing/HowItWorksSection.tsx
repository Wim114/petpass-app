import React from 'react';
import { Heart, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const HowItWorksSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="py-12 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">{t.howItWorks.title}</h2>
          <p className="text-slate-500 text-base sm:text-lg">{t.howItWorks.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 md:gap-12">
          {[
            {
              step: "01",
              title: t.howItWorks.step1Title,
              desc: t.howItWorks.step1Desc,
              icon: <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
            },
            {
              step: "02",
              title: t.howItWorks.step2Title,
              desc: t.howItWorks.step2Desc,
              icon: <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
            },
            {
              step: "03",
              title: t.howItWorks.step3Title,
              desc: t.howItWorks.step3Desc,
              icon: <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
            }
          ].map((item, idx) => (
            <div key={idx} className={`relative group animate-fade-up ${idx === 1 ? 'animate-delay-100' : idx === 2 ? 'animate-delay-200' : ''}`}>
              <div className="bg-slate-50 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 h-full border-2 border-transparent group-hover:border-emerald-100 group-hover:bg-white transition-all shadow-sm hover:shadow-xl">
                <span className="text-4xl sm:text-7xl font-black text-slate-200 group-hover:text-emerald-50/50 transition-colors absolute top-3 right-5 sm:top-4 sm:right-8 select-none">{item.step}</span>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center mb-5 sm:mb-8 border border-slate-100">
                    {item.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{item.desc}</p>
                </div>
              </div>
              {idx < 2 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 -translate-y-1/2 z-10">
                  <ChevronRight className="w-12 h-12 text-slate-200" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
