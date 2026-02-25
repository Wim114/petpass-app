import React from 'react';
import { ShieldCheck, Scissors, Heart, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const PartnersSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="partners" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              {t.partners.title1} <br/>
              <span className="text-emerald-600">{t.partners.title2}</span>
            </h2>
            <p className="text-lg text-slate-600">
              {t.partners.subtitle}
            </p>
            <div className="space-y-6">
              {[
                { title: t.partners.vets, icon: <ShieldCheck /> },
                { title: t.partners.grooming, icon: <Scissors /> },
                { title: t.partners.boutiques, icon: <Heart /> }
              ].map((cat, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    {cat.icon}
                  </div>
                  <span className="font-bold text-slate-800">{cat.title}</span>
                  <ChevronRight className="ml-auto w-5 h-5 text-slate-400" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-emerald-600 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="font-bold">{t.partners.transparency}</h4>
                <p className="text-emerald-100 text-sm">{t.partners.transparencyDesc}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4 sm:mt-12">
                 <div className="h-48 sm:h-56 lg:h-64 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                   <img src="https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?q=80&w=1976&auto=format&fit=crop" className="w-full h-full object-cover" alt="Happy dog in Vienna - affordable pet healthcare" />
                 </div>
                 <div className="h-36 sm:h-40 lg:h-48 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                   <img src="https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=1974&auto=format&fit=crop" className="w-full h-full object-cover" alt="Cat veterinary care Vienna - vaccinations included" />
                 </div>
              </div>
              <div className="space-y-4">
                <div className="h-36 sm:h-40 lg:h-48 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                   <img src="/french-bulldog.png" className="w-full h-full object-cover" alt="French bulldog sleeping - pet healthcare Vienna" />
                 </div>
                 <div className="h-48 sm:h-56 lg:h-64 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                   <img src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2069&auto=format&fit=crop" className="w-full h-full object-cover" alt="Dogs playing in Vienna park - pet healthcare membership" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
