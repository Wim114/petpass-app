import React from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface HeroSectionProps {
  onOpenModal: () => void;
  spotsLeft: number;
  percentage: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onOpenModal, spotsLeft, percentage }) => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm uppercase tracking-wider">
              <Star className="w-4 h-4 fill-current" />
              {t.hero.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 leading-tight">
              {t.hero.title1} <br />
              <span className="text-emerald-600">{t.hero.title2}</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-xl mx-auto lg:mx-0">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#plans"
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 text-center"
              >
                {t.hero.seePlans}
              </a>
              <button
                onClick={onOpenModal}
                className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:border-emerald-500 hover:text-emerald-600 transition-all text-center"
              >
                {t.hero.joinWaitlist}
              </button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-3 text-sm font-medium">
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <span className="text-amber-700 font-semibold">{t.hero.joinedBy}</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-emerald-600/10 rounded-3xl blur-2xl group-hover:bg-emerald-600/20 transition-all duration-500" />
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white">
              <img
                src="/hero-dog.png"
                alt="Happy dog playing with owner in Vienna"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg flex items-center gap-4 border border-white/50">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-black text-amber-600">{spotsLeft}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t.hero.spotsLeft.replace('{n}', String(spotsLeft))}</p>
                  <div className="w-32 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
                <span className="ml-auto text-sm font-bold text-amber-600">{percentage}% {t.hero.full}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
