// lib/guardian/db.ts
//
// Guardian-specific Supabase helper.
// Uses the existing supabaseAdmin() server client so Guardian APIs
// do not create a second connection style.

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export function guardianSupabase() {
  return supabaseAdmin();
}
