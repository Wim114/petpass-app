import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// In-memory lock to replace Navigator LockManager which can time out
// and block authentication entirely (especially with HMR or stale locks).
const inMemoryLocks = new Map<string, Promise<unknown>>();

async function inMemoryLock<R>(
  name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>,
): Promise<R> {
  const existing = inMemoryLocks.get(name);
  if (existing) {
    await existing.catch(() => {});
  }

  const promise = fn();
  inMemoryLocks.set(name, promise);

  try {
    return await promise;
  } finally {
    if (inMemoryLocks.get(name) === promise) {
      inMemoryLocks.delete(name);
    }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    lock: inMemoryLock,
  },
});
