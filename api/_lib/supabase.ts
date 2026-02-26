import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Verify a user's JWT and return the authenticated user.
 * Creates a per-request Supabase client with the user's token.
 */
export async function verifyUser(authHeader: string | undefined) {
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  return user;
}
