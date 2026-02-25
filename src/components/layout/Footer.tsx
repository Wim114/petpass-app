import React from 'react';
import { Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Pet Pass Vienna" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">Pet Pass Vienna</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-slate-500 font-medium text-sm">
            <Link to="/privacy" className="hover:text-emerald-600">{t.footer.privacy}</Link>
            <Link to="/terms" className="hover:text-emerald-600">{t.footer.terms}</Link>
            <a href="#" className="hover:text-emerald-600">{t.footer.impressum}</a>
            <a href="#" className="hover:text-emerald-600">{t.footer.contact}</a>
          </div>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/petpassvienna?igsh=d3pxZTczcjRoYm80"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-slate-100 rounded-full hover:bg-emerald-100 hover:text-emerald-600 transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
