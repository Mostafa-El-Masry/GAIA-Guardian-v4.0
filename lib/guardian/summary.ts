// lib/guardian/summary.ts
//
// GAIA Guardian · Day summary helper (4.0 core)
//
// Builds a small, human-friendly summary for a single day using
// the guardian_checkins table. This does NOT touch Dashboard/Gallery;
// it is just a service for APIs and views like /guardian-today.

import { guardianSupabase } from './db';
import type { GuardianCheckinRecord, GuardianCheckinStatus } from './types';

export interface GuardianDaySummary {
  date: string;
  total: number;
  answered: number;
  pending: number;
  skipped: number;
  // quick flags per type
  waterStatus?: GuardianCheckinStatus;
  studyStatus?: GuardianCheckinStatus;
  walkStatus?: GuardianCheckinStatus;
  // text for UI
  headline: string;
  detailLines: string[];
}

function makeHeadline(summary: Omit<GuardianDaySummary, 'headline' | 'detailLines'>): string {
  const { answered, total } = summary;
  if (total === 0) {
    return 'No questions for this day.';
  }
  if (answered === total) {
    return 'All questions answered. Great job.';
  }
  if (answered === 0) {
    return 'No questions answered yet.';
  }
  return `${answered} of ${total} questions answered.`;
}

export async function getGuardianDaySummary(dateIso: string): Promise<GuardianDaySummary | null> {
  const supabase = guardianSupabase();

  const { data, error } = await supabase
    .from('guardian_checkins')
    .select('*')
    .eq('checkin_date', dateIso)
    .order('type', { ascending: true });

  if (error) {
    // For summaries we prefer to fail silently: API can decide how to surface errors.
    console.error('[Guardian] summary error', error);
    return null;
  }

  const rows = (data ?? []) as GuardianCheckinRecord[];

  if (rows.length === 0) {
    return {
      date: dateIso,
      total: 0,
      answered: 0,
      pending: 0,
      skipped: 0,
      headline: 'No questions scheduled for this day.',
      detailLines: [],
    };
  }

  let answered = 0;
  let pending = 0;
  let skipped = 0;

  let waterStatus: GuardianCheckinStatus | undefined;
  let studyStatus: GuardianCheckinStatus | undefined;
  let walkStatus: GuardianCheckinStatus | undefined;

  for (const row of rows) {
    if (row.status === 'answered') answered += 1;
    else if (row.status === 'skipped') skipped += 1;
    else pending += 1;

    if (row.type === 'water') waterStatus = row.status;
    if (row.type === 'study') studyStatus = row.status;
    if (row.type === 'walk') walkStatus = row.status;
  }

  const base: Omit<GuardianDaySummary, 'headline' | 'detailLines'> = {
    date: dateIso,
    total: rows.length,
    answered,
    pending,
    skipped,
    waterStatus,
    studyStatus,
    walkStatus,
  };

  const headline = makeHeadline(base);

  const segments: string[] = [];
  if (waterStatus) segments.push(`Water: ${waterStatus}`);
  if (studyStatus) segments.push(`Study: ${studyStatus}`);
  if (walkStatus) segments.push(`Walk: ${walkStatus}`);

  const detailLines: string[] = [];
  detailLines.push(`Total questions: ${rows.length}`);
  detailLines.push(`Answered: ${answered}, Pending: ${pending}, Skipped: ${skipped}`);
  if (segments.length > 0) {
    detailLines.push(segments.join(' · '));
  }

  return {
    ...base,
    headline,
    detailLines,
  };
}
