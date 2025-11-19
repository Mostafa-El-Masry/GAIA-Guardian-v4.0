import { NextResponse } from 'next/server';
import { runDailyBrain } from '@/lib/guardian/brain';

// Simple health check / manual trigger for GAIA Brain.
// GET: runs brain for "now".
// POST: optionally accepts { date: string } ISO to run for a specific day.

export async function GET() {
  const now = new Date();
  const result = await runDailyBrain(now);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  let targetDate = new Date();

  try {
    const body = await request.json();
    if (body?.date) {
      const parsed = new Date(body.date);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    }
  } catch (error) {
    // Ignore body parse errors and fall back to "now".
  }

  const result = await runDailyBrain(targetDate);
  return NextResponse.json(result);
}
