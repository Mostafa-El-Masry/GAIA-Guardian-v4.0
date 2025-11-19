import { NextResponse } from 'next/server';
import { guardianSupabase } from '@/lib/guardian/db';
import type { GuardianCheckinStatus } from '@/lib/guardian/types';

// GAIA Guardian · Answer check-in API (4.0)
//
// POST /api/brain/checkins/answer
//
// Body:
//   {
//     "id": "checkin-id",
//     "status": "answered" | "skipped",
//     "answer": { ...optional json ... }
//   }

export async function POST(request: Request) {
  const supabase = guardianSupabase();

  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    const status = body?.status as GuardianCheckinStatus | undefined;
    const answer = body?.answer as any | undefined;

    if (!id || !status) {
      return NextResponse.json(
        { ok: false, error: 'Missing id or status.' },
        { status: 400 }
      );
    }
    if (status !== 'answered' && status !== 'skipped') {
      return NextResponse.json(
        { ok: false, error: 'Status must be answered or skipped.' },
        { status: 400 }
      );
    }

    const update: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (typeof answer !== 'undefined') {
      update.answer_json = answer;
    }

    const { data, error } = await supabase
      .from('guardian_checkins')
      .update(update)
      .eq('id', id)
      .select('*')
      .limit(1);

    if (error) {
      console.error('[Guardian] answer: error', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to update check-in.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, checkin: data && data[0] });
  } catch (err: any) {
    console.error('[Guardian] answer: exception', err);
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
