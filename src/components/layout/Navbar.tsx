import React, { useState } from 'react';
import { X, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuthStore } from '@/stores/authStore';

const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          lang === 'en'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('de')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
          lang === 'de'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        DE
      </button>
    </div>
  );
};

const Navbar: React.FC = () => {
  const { t } = useLanguage();
  const user = useAuthStore((s) => s.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Pet Pass Vienna" className="w-10 h-10 rounded-lg" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">Pet Pass <span className="text-emerald-600">Vienna</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">{t.nav.howItWorks}</a>
          <a href="#plans" className="hover:text-emerald-600 transition-colors">{t.nav.plans}</a>
          <a href="#partners" className="hover:text-emerald-600 transition-colors">{t.nav.partners}</a>
          <a href="#faq" className="hover:text-emerald-600 transition-colors">{t.nav.faq}</a>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />
          {user ? (
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              {t.nav.joinClub}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors">{t.nav.howItWorks}</a>
            <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors">{t.nav.plans}</a>
            <a href="#partners" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors">{t.nav.partners}</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors">{t.nav.faq}</a>
            {user ? (
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="sm:hidden mt-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold text-center hover:bg-slate-800 transition-all">Dashboard</Link>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="sm:hidden mt-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-semibold text-center hover:bg-slate-800 transition-all">{t.nav.joinClub}</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
