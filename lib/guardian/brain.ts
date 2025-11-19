import type { GuardianBrainRunResult } from './types';
import { guardianSupabase } from './db';
import { ensureDailyCheckins } from './checkins';

// GAIA Guardian · Brain (Level 3)
// Week 5: Brain now logs its run AND ensures simple daily check-ins exist.
//
// Still NO direct connection to Gallery, Dashboard, or Health tables yet.
// We only touch:
//   - guardian_daily_runs
//   - guardian_checkins

export async function runDailyBrain(targetDate: Date): Promise<GuardianBrainRunResult> {
  const ranAt = new Date();
  const targetIso = targetDate.toISOString();
  const runDate = targetIso.slice(0, 10); // "YYYY-MM-DD"

  const notes: string[] = [
    'GAIA Guardian · Brain executed.',
    'Week 5 – logging this run and ensuring daily check-ins exist.',
  ];

  // 1) Log the Brain run itself (guardian_daily_runs)
  try {
    const client = guardianSupabase();
    const { error } = await client
      .from('guardian_daily_runs')
      .insert({
        user_id: null,          // multi-user will fill this later
        run_date: runDate,
        ran_at: ranAt.toISOString(),
        notes,
      });

    if (error) {
      notes.push('Daily run log failed: ' + error.message);
    } else {
      notes.push('Daily run log succeeded: guardian_daily_runs row inserted.');
    }
  } catch (err: any) {
    notes.push('Daily run log threw an exception: ' + String(err?.message ?? err));
  }

  // 2) Ensure simple daily check-ins exist (guardian_checkins)
  await ensureDailyCheckins(runDate, notes);

  return {
    ok: true,
    ranAt: ranAt.toISOString(),
    targetDate: targetIso,
    notes,
  };
}
