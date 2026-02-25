import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface PricingSectionProps {
  onOpenModal: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onOpenModal }) => {
  const { t } = useLanguage();

  const plans = [
    {
      name: t.pricing.basic.name,
      price: "16",
      description: t.pricing.basic.description,
      features: t.pricing.basic.features,
    },
    {
      name: t.pricing.carePlus.name,
      price: "39",
      description: t.pricing.carePlus.description,
      features: t.pricing.carePlus.features,
      isPopular: true,
    },
    {
      name: t.pricing.vip.name,
      price: "99",
      description: t.pricing.vip.description,
      features: t.pricing.vip.features,
    },
  ];

  return (
    <section id="plans" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">{t.pricing.title1} <br/><span className="text-emerald-600">{t.pricing.title2}</span></h2>
          <p className="text-slate-500 text-lg">{t.pricing.subtitle}</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col bg-white rounded-[2rem] p-8 border-2 ${plan.isPopular ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-white'} shadow-xl transition-transform hover:-translate-y-2 duration-300 animate-fade-up ${idx === 1 ? 'animate-delay-100' : idx === 2 ? 'animate-delay-200' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  {t.pricing.mostPopular}
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm h-10">{plan.description}</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-black text-slate-900">€{plan.price}</span>
                <span className="text-slate-500 font-medium">{t.pricing.perMonth}</span>
              </div>
              <ul className="space-y-4 mb-12 flex-grow">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-slate-600 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={onOpenModal}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                  plan.isPopular
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                {plan.isPopular ? t.pricing.getStarted : t.pricing.joinNow}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
