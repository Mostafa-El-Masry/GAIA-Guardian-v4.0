import { NextResponse } from 'next/server';
import { guardianSupabase } from '@/lib/guardian/db';
import type { GuardianCheckinType } from '@/lib/guardian/types';

function toDateOnlyIso(d: Date): string {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// GAIA Guardian · Brain run API (4.0)
//
// POST /api/brain/run
//   Body: { date?: 'YYYY-MM-DD' }
//   If date is omitted, uses today's date.
//
// Responsibilities:
//   - Ensure a guardian_daily_runs row exists for that date.
//   - Ensure guardian_checkins rows exist for that date & types (water/study/walk).
//   - Does NOT delete or modify existing answers.

export async function POST(request: Request) {
  const supabase = guardianSupabase();

  try {
    let dateIso: string | null = null;
    try {
      const body = await request.json();
      if (body && typeof body.date === 'string' && body.date.length >= 10) {
        dateIso = body.date.slice(0, 10);
      }
    } catch {
      // ignore body parse errors, fall back to today
    }
    if (!dateIso) {
      dateIso = toDateOnlyIso(new Date());
    }

    // Guardian daily run
    const { data: existingRuns, error: runsError } = await supabase
      .from('guardian_daily_runs')
      .select('*')
      .eq('run_date', dateIso)
      .limit(1);

    if (runsError) {
      console.error('[Guardian] run: error selecting runs', runsError);
      return NextResponse.json(
        { ok: false, date: dateIso, error: 'Failed to read daily runs.' },
        { status: 500 }
      );
    }

    let runRow = existingRuns && existingRuns[0];

    if (!runRow) {
      const { data: inserted, error: insertError } = await supabase
        .from('guardian_daily_runs')
        .insert({ run_date: dateIso })
        .select('*')
        .limit(1);

      if (insertError) {
        console.error('[Guardian] run: error inserting run', insertError);
        return NextResponse.json(
          { ok: false, date: dateIso, error: 'Failed to create daily run.' },
          { status: 500 }
        );
      }
      runRow = inserted && inserted[0];
    }

    // Ensure check-ins exist
    const templates: { type: GuardianCheckinType; question: string }[] = [
      { type: 'water', question: 'Did you drink water today?' },
      { type: 'study', question: 'Did you study or learn today?' },
      { type: 'walk', question: 'Did you walk or move your body today?' },
    ];

    const { data: existingCheckins, error: checkinsError } = await supabase
      .from('guardian_checkins')
      .select('id,type')
      .eq('checkin_date', dateIso);

    if (checkinsError) {
      console.error('[Guardian] run: error selecting checkins', checkinsError);
      return NextResponse.json(
        { ok: false, date: dateIso, error: 'Failed to read check-ins.' },
        { status: 500 }
      );
    }

    const existingTypes = new Set<string>(
      (existingCheckins ?? []).map((row: any) => row.type)
    );

    const rowsToInsert = templates
      .filter((t) => !existingTypes.has(t.type))
      .map((t) => ({
        checkin_date: dateIso,
        type: t.type,
        status: 'pending',
        question: t.question,
      }));

    let createdCount = 0;
    if (rowsToInsert.length > 0) {
      const { error: insertCheckinsError } = await supabase
        .from('guardian_checkins')
        .insert(rowsToInsert);
      if (insertCheckinsError) {
        console.error('[Guardian] run: error inserting checkins', insertCheckinsError);
        return NextResponse.json(
          { ok: false, date: dateIso, error: 'Failed to create check-ins.' },
          { status: 500 }
        );
      }
      createdCount = rowsToInsert.length;
    }

    const { data: dayCheckins, error: finalCheckinsError } = await supabase
      .from('guardian_checkins')
      .select('*')
      .eq('checkin_date', dateIso)
      .order('type', { ascending: true });

    if (finalCheckinsError) {
      console.error('[Guardian] run: error fetching final checkins', finalCheckinsError);
    }

    return NextResponse.json({
      ok: true,
      date: dateIso,
      run: runRow,
      created_checkins: createdCount,
      checkins: dayCheckins ?? [],
    });
  } catch (err: any) {
    console.error('[Guardian] run: exception', err);
    return NextResponse.json(
      { ok: false, date: null, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
