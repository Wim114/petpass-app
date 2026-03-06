import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuthStore } from '@/stores/authStore';
import { useNews } from '@/hooks/useNews';
import Modal from '@/components/ui/Modal';
import type { NewsArticle } from '@/types';

export default function NewsSection() {
  const { lang, t } = useLanguage();
  const { user } = useAuthStore();
  const { articles } = useNews();
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  if (articles.length === 0) return null;

  const displayedArticles = articles.slice(0, 6);

  const handleLearnMore = (article: NewsArticle) => {
    if (!user) {
      navigate('/signup');
      return;
    }
    setSelectedArticle(article);
  };

  const getTitle = (article: NewsArticle) =>
    lang === 'de' ? article.title_de : article.title_en;

  const getSummary = (article: NewsArticle) =>
    lang === 'de' ? article.summary_de : article.summary_en;

  const getContent = (article: NewsArticle) =>
    lang === 'de' ? article.content_de : article.content_en;

  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center" data-reveal>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {t.news.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            {t.news.subtitle}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedArticles.map((article) => (
            <div
              key={article.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                backgroundColor: article.bg_color || '#ffffff',
                color: article.text_color || '#1e293b',
              }}
              data-reveal
            >
              {/* Image */}
              {article.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={getTitle(article)}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                {/* Category Badge */}
                {article.category && (
                  <span
                    className="mb-3 inline-block w-fit rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: article.badge_color || '#10b981' }}
                  >
                    {article.category}
                  </span>
                )}

                {/* Title */}
                <h3 className="mb-2 text-lg font-bold leading-tight sm:text-xl">
                  {getTitle(article)}
                </h3>

                {/* Summary */}
                <p className="mb-4 flex-1 text-sm leading-relaxed opacity-80 line-clamp-3">
                  {getSummary(article)}
                </p>

                {/* Learn More Button */}
                <button
                  onClick={() => handleLearnMore(article)}
                  className="mt-auto flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70"
                  style={{ color: article.badge_color || '#10b981' }}
                >
                  {t.news.learnMore}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Signup prompt for non-logged-in users */}
        {!user && (
          <p className="mt-8 text-center text-sm text-slate-500">
            {t.news.signupToRead}
          </p>
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <Modal
          isOpen={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
          title={getTitle(selectedArticle)}
          maxWidth="max-w-2xl"
        >
          {selectedArticle.image_url && (
            <img
              src={selectedArticle.image_url}
              alt={getTitle(selectedArticle)}
              className="mb-4 w-full rounded-xl object-cover"
            />
          )}
          {selectedArticle.category && (
            <span
              className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ backgroundColor: selectedArticle.badge_color || '#10b981' }}
            >
              {selectedArticle.category}
            </span>
          )}
          <div className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {getContent(selectedArticle)}
          </div>
        </Modal>
      )}
    </section>
  );
}
