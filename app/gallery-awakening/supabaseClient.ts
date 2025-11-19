import { createClient } from '@supabase/supabase-js';

/**
 * GAIA Awakening · Supabase client (browser-side).
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // We do NOT throw – Gallery can still work from mock data + local cache.
  console.warn(
    '[GAIA Gallery] Supabase env vars are missing. The Gallery will fall back to local cache + mock data.'
  );
}

export const supabase =
  url && anonKey
    ? createClient(url, anonKey)
    : null;
