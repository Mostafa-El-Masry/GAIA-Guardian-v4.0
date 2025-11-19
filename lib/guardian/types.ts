// Basic types for GAIA Guardian (Level 3) Brain.

export type GaiaJobType = 'daily-summary' | 'gallery-feature' | 'health-checkin';

export interface GaiaJobDefinition {
  id: string;
  type: GaiaJobType;
  description: string;
  isActive: boolean;
  // For Level 3, we start with a very simple schedule: daily.
  schedule: 'daily';
}

export interface GaiaDailyContext {
  userId?: string | null; // optional for now; we will wire real users later
  dateIso: string; // e.g. "2027-01-01"
}

export interface GaiaBrainRunResult {
  ok: boolean;
  ranAt: string;
  targetDate: string;
  notes: string[];
}

// Week 2 – database-facing shape for daily Brain runs.
// This matches the guardian_daily_runs table you create in Supabase.
export interface GuardianDailyRunRecord {
  id: string;           // uuid as a string
  user_id: string | null;
  run_date: string;     // 'YYYY-MM-DD'
  ran_at: string;       // ISO timestamp string
  notes: string[];      // parsed from a jsonb column
  created_at: string;   // ISO timestamp string
}

// Week 5 – check-in scaffolding for daily questions.

export type GuardianCheckinType = 'water' | 'study' | 'walk';

export type GuardianCheckinStatus = 'pending' | 'answered' | 'skipped';

// Matches the guardian_checkins table in Supabase (Week 5).
export interface GuardianCheckinRecord {
  id: string;
  user_id: string | null;
  checkin_date: string;         // 'YYYY-MM-DD'
  type: GuardianCheckinType;
  status: GuardianCheckinStatus;
  question: string;
  answer_json: any;             // parsed from jsonb
  created_at: string;
  updated_at: string;
}

// Week 6 – payload for answering a check-in via API.
export interface GuardianCheckinAnswerPayload {
  id: string;
  status: GuardianCheckinStatus;
  answer?: any;
}
