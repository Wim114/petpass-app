import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNews } from '@/hooks/useNews';
import { Spinner } from '@/components/ui/Spinner';
import type { NewsArticle } from '@/types';

export default function HubPage() {
  const { lang, t } = useLanguage();
  const { articles, isLoading } = useNews();
  const [searchParams] = useSearchParams();
  const articleRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const targetArticleId = searchParams.get('article');

  useEffect(() => {
    if (targetArticleId && articleRefs.current[targetArticleId]) {
      articleRefs.current[targetArticleId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [targetArticleId, articles]);

  const getTitle = (article: NewsArticle) =>
    lang === 'de' ? article.title_de : article.title_en;

  const getContent = (article: NewsArticle) =>
    lang === 'de' ? article.content_de : article.content_en;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{t.hub.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{t.hub.subtitle}</p>
      </div>

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 py-16 text-center">
          <Newspaper className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-slate-500">{t.hub.noContent}</p>
        </div>
      )}

      {/* Articles */}
      <div className="space-y-6">
        {articles.map((article) => (
          <div
            key={article.id}
            ref={(el) => { articleRefs.current[article.id] = el; }}
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow ${
              targetArticleId === article.id
                ? 'border-emerald-300 ring-2 ring-emerald-100'
                : 'border-slate-200'
            }`}
          >
            {/* Image */}
            {article.image_url && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={article.image_url}
                  alt={getTitle(article)}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-5 sm:p-6">
              {/* Category + Date */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {article.category && (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: article.badge_color || '#10b981' }}
                  >
                    {article.category}
                  </span>
                )}
                <span className="text-xs text-slate-400">
                  {t.hub.publishedOn} {formatDate(article.created_at)}
                </span>
              </div>

              {/* Title */}
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                {getTitle(article)}
              </h3>

              {/* Full content */}
              <div className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {getContent(article)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
