import { createClient } from '@supabase/supabase-js';

// GAIA Guardian · Supabase client for Brain logging.
//
// This uses your existing Supabase project keys from environment variables.
// For Level 3, we keep it simple:
//   - URL:  process.env.NEXT_PUBLIC_SUPABASE_URL
//   - KEY:  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
//
// These should already exist from your earlier GAIA Awakening work.
// If they do not, add them to your .env.local file.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // We avoid throwing here so your app does not crash if env vars are missing.
  // The brain.ts file will detect failures when it tries to use this client.
  console.warn(
    '[GAIA Guardian] Supabase environment variables are missing. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local.'
  );
}

export const guardianSupabase = createClient(supabaseUrl ?? '', supabaseKey ?? '');
