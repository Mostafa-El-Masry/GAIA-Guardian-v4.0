// lib/guardian/types.ts
//
// Shared types for GAIA Guardian core (4.0).
// These match the expected Supabase tables:
//
//   guardian_daily_runs
//   guardian_checkins
//
// Make sure your Supabase schema has compatible columns (see README).

export type GuardianCheckinType = 'water' | 'study' | 'walk';

export type GuardianCheckinStatus = 'pending' | 'answered' | 'skipped';

export interface GuardianDailyRun {
  id: string;
  run_date: string;      // 'YYYY-MM-DD'
  created_at: string;
  // Optional extra metadata if you decide to add it later:
  meta_json?: any | null;
}

export interface GuardianCheckinRecord {
  id: string;
  user_id: string | null;
  checkin_date: string;          // 'YYYY-MM-DD'
  type: GuardianCheckinType;
  status: GuardianCheckinStatus;
  question: string;
  answer_json: any | null;
  created_at: string;
  updated_at: string;
}

export interface GuardianBrainRunResult {
  ok: boolean;
  ranAt: string;
  targetDate: string;
  notes: string[];
}
