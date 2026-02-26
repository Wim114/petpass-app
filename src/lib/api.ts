import { supabase } from './supabase';

/**
 * Call a Vercel serverless API endpoint with automatic auth header injection.
 */
export async function apiCall<T = any>(
  endpoint: string,
  options?: { body?: Record<string, unknown>; method?: string }
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(`/api/${endpoint}`, {
    method: options?.method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || res.statusText);
  }

  return data as T;
}
