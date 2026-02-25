import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors pr-4">
          {question}
        </span>
        <ChevronRight className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-6 text-slate-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

const FaqSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4 animate-fade-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">{t.faq.title}</h2>
          <p className="text-slate-500 text-lg">{t.faq.subtitle}</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-fade-up">
          {[
            { q: t.faq.q1, a: t.faq.a1 },
            { q: t.faq.q2, a: t.faq.a2 },
            { q: t.faq.q3, a: t.faq.a3 },
            { q: t.faq.q4, a: t.faq.a4 },
            { q: t.faq.q5, a: t.faq.a5 },
            { q: t.faq.q6, a: t.faq.a6 },
          ].map((item, idx) => (
            <FAQItem key={idx} question={item.q} answer={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
