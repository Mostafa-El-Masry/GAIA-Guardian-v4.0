import { guardianSupabase } from './db';
import type { GuardianCheckinType } from './types';

// GAIA Guardian · Check-ins helper
// Week 5 – ensure simple daily check-ins exist for a given date.
//
// For now this is unconditional:
//   - For each day, create 3 pending check-ins:
//       - water: "Did you drink water today?"
//       - study: "Did you study today?"
//       - walk:  "Did you walk today?"
//
// Later, when Health + Academy are connected, this function can become
// smarter (only create if there are missing logs, etc.).

const CHECKIN_TYPES: GuardianCheckinType[] = ['water', 'study', 'walk'];

const CHECKIN_QUESTIONS: Record<GuardianCheckinType, string> = {
  water: 'Did you drink water today?',
  study: 'Did you study today?',
  walk: 'Did you walk today?',
};

export async function ensureDailyCheckins(runDate: string, notes: string[]): Promise<void> {
  // runDate is 'YYYY-MM-DD'
  try {
    const client = guardianSupabase();
    const { data, error } = await client
      .from('guardian_checkins')
      .select('*')
      .eq('checkin_date', runDate)
      .limit(100);

    if (error) {
      notes.push('Check-ins: failed to read existing rows: ' + error.message);
      return;
    }

    const existing = data ?? [];
    const existingTypes = new Set<string>(existing.map((row: any) => row.type));

    const missingTypes = CHECKIN_TYPES.filter((t) => !existingTypes.has(t));

    if (missingTypes.length === 0) {
      notes.push('Check-ins: all daily check-ins already exist for ' + runDate + '.');
      return;
    }

    const rowsToInsert = missingTypes.map((type) => ({
      user_id: null, // multi-user will fill this in future
      checkin_date: runDate,
      type,
      status: 'pending',
      question: CHECKIN_QUESTIONS[type],
      answer_json: null,
    }));

    const { error: insertError } = await client
      .from('guardian_checkins')
      .insert(rowsToInsert);

    if (insertError) {
      notes.push('Check-ins: failed to insert new rows: ' + insertError.message);
    } else {
      notes.push(
        'Check-ins: created ' +
          rowsToInsert.length +
          ' pending check-ins for ' +
          runDate +
          '.'
      );
    }
  } catch (err: any) {
    notes.push('Check-ins: exception while ensuring daily check-ins: ' + String(err?.message ?? err));
  }
}
