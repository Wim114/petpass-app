import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/lib/api';
import type { NewsConfig, NewsArticle } from '@/types';

const DEFAULT_ARTICLES: NewsArticle[] = [];

async function fetchNews(): Promise<NewsConfig> {
  try {
    const res = await fetch('/api/news');
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    if (data?.articles && Array.isArray(data.articles)) {
      return data as NewsConfig;
    }
    return { articles: DEFAULT_ARTICLES };
  } catch {
    return { articles: DEFAULT_ARTICLES };
  }
}

async function fetchNewsAdmin(): Promise<NewsConfig> {
  try {
    const data = await apiCall<NewsConfig>('news?include_drafts=true', { method: 'GET' });
    if (data?.articles && Array.isArray(data.articles)) {
      return data;
    }
    return { articles: DEFAULT_ARTICLES };
  } catch {
    return { articles: DEFAULT_ARTICLES };
  }
}

export function useNews() {
  const query = useQuery<NewsConfig>({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    articles: query.data?.articles ?? DEFAULT_ARTICLES,
  };
}

export function useNewsAdmin() {
  const query = useQuery<NewsConfig>({
    queryKey: ['news', 'admin'],
    queryFn: fetchNewsAdmin,
    staleTime: 1000 * 60 * 2,
  });

  return {
    ...query,
    articles: query.data?.articles ?? DEFAULT_ARTICLES,
  };
}
