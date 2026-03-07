import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Image,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useNewsAdmin } from '@/hooks/useNews';
import { apiCall } from '@/lib/api';
import type { NewsArticle } from '@/types';

function createEmptyArticle(): NewsArticle {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title_en: '',
    title_de: '',
    summary_en: '',
    summary_de: '',
    content_en: '',
    content_de: '',
    image_url: '',
    category: '',
    bg_color: '#ffffff',
    text_color: '#1e293b',
    badge_color: '#10b981',
    published: false,
    created_at: now,
    updated_at: now,
  };
}

export default function NewsManagement() {
  const queryClient = useQueryClient();
  const { articles: savedArticles, isLoading } = useNewsAdmin();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (savedArticles && savedArticles.length > 0) {
      setArticles(JSON.parse(JSON.stringify(savedArticles)));
    }
  }, [savedArticles]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiCall('news', {
        method: 'PUT',
        body: { articles: articles.map((a) => ({ ...a, updated_at: new Date().toISOString() })) },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      setToast({ type: 'success', message: 'News articles saved successfully!' });
      setTimeout(() => setToast(null), 3000);
    },
    onError: (err: Error) => {
      setToast({ type: 'error', message: err.message || 'Failed to save news articles.' });
      setTimeout(() => setToast(null), 5000);
    },
  });

  const updateArticle = (id: string, field: keyof NewsArticle, value: string | boolean) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const addArticle = () => {
    const newArticle = createEmptyArticle();
    setArticles((prev) => [newArticle, ...prev]);
    setExpandedIds((prev) => new Set(prev).add(newArticle.id));
  };

  const removeArticle = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasChanges = JSON.stringify(articles) !== JSON.stringify(savedArticles);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">News Management</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage news articles displayed on the landing page.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addArticle}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Add Article
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !hasChanges}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* Unsaved changes */}
      {hasChanges && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4" />
          You have unsaved changes. Click "Save Changes" to publish them.
        </div>
      )}

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 py-16 text-center">
          <p className="text-slate-500">No news articles yet. Click "Add Article" to create one.</p>
        </div>
      )}

      {/* Article Cards */}
      <div className="space-y-4">
        {articles.map((article) => {
          const isExpanded = expandedIds.has(article.id);

          return (
            <div
              key={article.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Collapsed Header */}
              <div
                className="flex cursor-pointer items-center justify-between px-6 py-4"
                onClick={() => toggleExpanded(article.id)}
              >
                <div className="flex items-center gap-3">
                  {article.published ? (
                    <Eye className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  )}
                  <h3 className="font-semibold text-slate-900">
                    {article.title_en || 'Untitled Article'}
                  </h3>
                  {article.category && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      style={{ backgroundColor: article.badge_color }}
                    >
                      {article.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-6 py-6 space-y-6">
                  {/* Published Toggle + Delete */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={article.published}
                        onChange={(e) => updateArticle(article.id, 'published', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Published</span>
                    </label>
                    <button
                      onClick={() => removeArticle(article.id)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                  {/* Titles */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Title (English)
                      </label>
                      <input
                        type="text"
                        value={article.title_en}
                        onChange={(e) => updateArticle(article.id, 'title_en', e.target.value)}
                        placeholder="Article title..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Title (Deutsch)
                      </label>
                      <input
                        type="text"
                        value={article.title_de}
                        onChange={(e) => updateArticle(article.id, 'title_de', e.target.value)}
                        placeholder="Artikeltitel..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                  </div>

                  {/* Summaries */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Summary (English)
                      </label>
                      <textarea
                        value={article.summary_en}
                        onChange={(e) => updateArticle(article.id, 'summary_en', e.target.value)}
                        rows={2}
                        placeholder="Short preview text..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Summary (Deutsch)
                      </label>
                      <textarea
                        value={article.summary_de}
                        onChange={(e) => updateArticle(article.id, 'summary_de', e.target.value)}
                        rows={2}
                        placeholder="Kurzer Vorschautext..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Content (English)
                      </label>
                      <textarea
                        value={article.content_en}
                        onChange={(e) => updateArticle(article.id, 'content_en', e.target.value)}
                        rows={8}
                        placeholder="Full article content. Use blank lines for paragraphs."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Content (Deutsch)
                      </label>
                      <textarea
                        value={article.content_de}
                        onChange={(e) => updateArticle(article.id, 'content_de', e.target.value)}
                        rows={8}
                        placeholder="Vollständiger Artikelinhalt. Leerzeilen für Absätze verwenden."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                  </div>

                  {/* Image URL + Category */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        <Image className="h-4 w-4" />
                        Image URL (optional)
                      </label>
                      <input
                        type="text"
                        value={article.image_url}
                        onChange={(e) => updateArticle(article.id, 'image_url', e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Category
                      </label>
                      <input
                        type="text"
                        value={article.category}
                        onChange={(e) => updateArticle(article.id, 'category', e.target.value)}
                        placeholder="e.g. Health, Events, Tips"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                    </div>
                  </div>

                  {/* Style / Colors */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-700">
                      Card Style
                    </label>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Background Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={article.bg_color}
                            onChange={(e) => updateArticle(article.id, 'bg_color', e.target.value)}
                            className="h-9 w-12 cursor-pointer rounded border border-slate-300"
                          />
                          <input
                            type="text"
                            value={article.bg_color}
                            onChange={(e) => updateArticle(article.id, 'bg_color', e.target.value)}
                            className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Text Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={article.text_color}
                            onChange={(e) => updateArticle(article.id, 'text_color', e.target.value)}
                            className="h-9 w-12 cursor-pointer rounded border border-slate-300"
                          />
                          <input
                            type="text"
                            value={article.text_color}
                            onChange={(e) => updateArticle(article.id, 'text_color', e.target.value)}
                            className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-500">Badge Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={article.badge_color}
                            onChange={(e) => updateArticle(article.id, 'badge_color', e.target.value)}
                            className="h-9 w-12 cursor-pointer rounded border border-slate-300"
                          />
                          <input
                            type="text"
                            value={article.badge_color}
                            onChange={(e) => updateArticle(article.id, 'badge_color', e.target.value)}
                            className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-700">
                      Card Preview
                    </label>
                    <div
                      className="max-w-sm overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                      style={{
                        backgroundColor: article.bg_color,
                        color: article.text_color,
                      }}
                    >
                      {article.image_url && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={article.image_url}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        {article.category && (
                          <span
                            className="mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold text-white"
                            style={{ backgroundColor: article.badge_color }}
                          >
                            {article.category}
                          </span>
                        )}
                        <h4 className="mb-1 text-lg font-bold">
                          {article.title_en || 'Article Title'}
                        </h4>
                        <p className="text-sm opacity-80 line-clamp-2">
                          {article.summary_en || 'Article summary will appear here...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
