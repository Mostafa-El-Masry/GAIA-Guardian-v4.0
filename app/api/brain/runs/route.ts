import { NextResponse } from 'next/server';
import { guardianSupabase } from '@/lib/guardian/db';

// GAIA Guardian · Daily runs list (4.0)
//
// GET /api/brain/runs
//   Optional: ?limit=30
//
// Returns recent guardian_daily_runs rows ordered by run_date desc.

export async function GET(request: Request) {
  const supabase = guardianSupabase();

  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? Math.max(1, Math.min(365, Number(limitParam))) : 60;

    const { data, error } = await supabase
      .from('guardian_daily_runs')
      .select('*')
      .order('run_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Guardian] runs: error', error);
      return NextResponse.json(
        { ok: false, runs: [], error: 'Failed to load Guardian runs.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, runs: data ?? [] });
  } catch (err: any) {
    console.error('[Guardian] runs: exception', err);
    return NextResponse.json(
      { ok: false, runs: [], error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
