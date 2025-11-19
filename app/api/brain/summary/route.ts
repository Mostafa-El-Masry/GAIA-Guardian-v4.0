import { NextResponse } from 'next/server';
import { getGuardianDaySummary } from '@/lib/guardian/summary';

function toDateOnlyIso(d: Date): string {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// GAIA Guardian · Day summary API (4.0)
//
// GET /api/brain/summary
//   ?date=YYYY-MM-DD   (optional, defaults to today)
//
// Returns a compact summary object for the given date, or a simple
// "no questions" payload if none exist.

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    const dateIso = dateParam || toDateOnlyIso(new Date());

    const summary = await getGuardianDaySummary(dateIso);

    if (!summary) {
      return NextResponse.json({
        ok: false,
        date: dateIso,
        summary: null,
        error: 'Unable to build summary (check Supabase connection).',
      });
    }

    return NextResponse.json({
      ok: true,
      date: dateIso,
      summary,
    });
  } catch (err: any) {
    console.error('[Guardian] summary: exception', err);
    return NextResponse.json(
      {
        ok: false,
        date: null,
        summary: null,
        error: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}
