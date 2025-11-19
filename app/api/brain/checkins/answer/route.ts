import { NextResponse } from 'next/server';
import { guardianSupabase } from '@/lib/guardian/db';
import type { GuardianCheckinAnswerPayload } from '@/lib/guardian/types';

// GAIA Guardian · Brain check-ins answer API
// Week 6: allow updating status + answer_json for a single check-in.
//
// POST /api/brain/checkins/answer
//   body: { id: string, status: 'answered' | 'skipped', answer?: any }

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GuardianCheckinAnswerPayload | null;

    if (!body || !body.id || !body.status) {
      return NextResponse.json(
        { ok: false, error: 'Missing id or status in request body.' },
        { status: 400 }
      );
    }

    if (!['answered', 'skipped'].includes(body.status)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid status. Must be "answered" or "skipped".' },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {
      status: body.status,
      updated_at: new Date().toISOString(),
    };

    if (typeof body.answer !== 'undefined') {
      updatePayload.answer_json = body.answer;
    }

    const { error } = await guardianSupabase
      .from('guardian_checkins')
      .update(updatePayload)
      .eq('id', body.id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
