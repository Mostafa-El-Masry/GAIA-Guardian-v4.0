import { NextResponse } from 'next/server';
import { guardianSupabase } from '@/lib/guardian/db';
import type { GuardianCheckinRecord } from '@/lib/guardian/types';

// GAIA Guardian · Brain check-ins API
// Week 5: fetch daily check-ins for a given date (or today by default).

function toDateOnlyIso(d: Date): string {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    let dateIso: string;

    if (dateParam) {
      // Expecting "YYYY-MM-DD"
      dateIso = dateParam;
    } else {
      dateIso = toDateOnlyIso(new Date());
    }

    const { data, error } = await guardianSupabase
      .from('guardian_checkins')
      .select('*')
      .eq('checkin_date', dateIso)
      .order('type', { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          date: dateIso,
          checkins: [] as GuardianCheckinRecord[],
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
    return NextResponse.json(
      {
        ok: false,
        error: String(err?.message ?? err),
        date: null,
        checkins: [] as GuardianCheckinRecord[],
      },
      { status: 500 }
    );
  }
}
