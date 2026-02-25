import React from 'react';
import { Stethoscope, Scissors, MapPin } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const ProblemSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
            {t.problem.title1} <span className="text-emerald-400">{t.problem.title2}</span> {t.problem.title3}
          </h2>
          <p className="text-xl text-slate-400">
            {t.problem.subtitle} <strong className="text-white">{t.problem.annually}</strong> {t.problem.subtitle2}
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-12">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all animate-fade-up">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.problem.preventiveCare}</h3>
              <p className="text-slate-400 text-sm">{t.problem.preventiveDesc}</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all animate-fade-up animate-delay-100">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.problem.groomingPerks}</h3>
              <p className="text-slate-400 text-sm">{t.problem.groomingDesc}</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all animate-fade-up animate-delay-200">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.problem.localDiscounts}</h3>
              <p className="text-slate-400 text-sm">{t.problem.localDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
