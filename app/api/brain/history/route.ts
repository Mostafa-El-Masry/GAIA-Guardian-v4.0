import { NextResponse } from 'next/server';
import { guardianSupabase } from '@/lib/guardian/db';
import type { GuardianDailyRun } from '@/lib/guardian/types';

// GAIA Guardian · Brain history API
// Week 4: fetch recent guardian_daily_runs for debug / future dashboard.

export async function GET() {
  try {
    const client = guardianSupabase();
    const { data, error } = await client
      .from('guardian_daily_runs')
      .select('*')
      .order('run_date', { ascending: false })
      .order('ran_at', { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, runs: [] as GuardianDailyRun[] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      runs: (data ?? []) as GuardianDailyRun[],
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: String(err?.message ?? err),
        runs: [] as GuardianDailyRun[],
      },
      { status: 500 }
    );
  }
}
