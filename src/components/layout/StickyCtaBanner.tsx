import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface StickyCtaBannerProps {
  onOpenModal: () => void;
}

const StickyCtaBanner: React.FC<StickyCtaBannerProps> = ({ onOpenModal }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <button
        onClick={onOpenModal}
        className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
      >
        {t.stickyCta.joinNow}
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default StickyCtaBanner;
