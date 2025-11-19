import { NextResponse } from 'next/server';
import { guardianSupabase } from '@/lib/guardian/db';
import type { GuardianCheckinRecord } from '@/lib/guardian/types';

function toDateOnlyIso(d: Date): string {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// GAIA Guardian · Day check-ins API (4.0)
//
// GET /api/brain/checkins
//   ?date=YYYY-MM-DD   (optional, defaults to today)
//
// Returns all guardian_checkins for that date.

export async function GET(request: Request) {
  const supabase = guardianSupabase();

  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    const dateIso = dateParam || toDateOnlyIso(new Date());

    const { data, error } = await supabase
      .from('guardian_checkins')
      .select('*')
      .eq('checkin_date', dateIso)
      .order('type', { ascending: true });

    if (error) {
      console.error('[Guardian] checkins: error', error);
      return NextResponse.json(
        {
          ok: false,
          date: dateIso,
          checkins: [],
          error: 'Failed to load Guardian check-ins.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      date: dateIso,
      checkins: (data ?? []) as GuardianCheckinRecord[],
    });
  } catch (err: any) {
    console.error('[Guardian] checkins: exception', err);
    return NextResponse.json(
      {
        ok: false,
        date: null,
        checkins: [],
        error: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}
