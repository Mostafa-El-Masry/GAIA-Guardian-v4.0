// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client (service role).
// DO NOT import this in client components.
export function supabaseAdmin() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL fallback) in environment"
    );
  }
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
