'use client';

import { useEffect, useState } from 'react';

type GuardianCheckinType = 'water' | 'study' | 'walk';
type GuardianCheckinStatus = 'pending' | 'answered' | 'skipped';

interface GuardianCheckin {
  id: string;
  type: GuardianCheckinType;
  status: GuardianCheckinStatus;
}

interface CheckinsResponse {
  ok: boolean;
  date: string | null;
  checkins: GuardianCheckin[];
  error?: string;
}

const EVENING_START_HOUR = 20; // 8 PM local time
const STORAGE_KEY_PREFIX = 'guardian_nudge_seen:';

function getTodayKey(): { key: string; dateIso: string } {
  const now = new Date();
  const dateIso = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const key = STORAGE_KEY_PREFIX + dateIso;
  return { key, dateIso };
}

interface Props {
  // optional: allow you to force it off for certain layouts if ever needed
  disabled?: boolean;
}

// GAIA Guardian · Nudge client (4.0)
//
// Small client component that can be placed on the Dashboard to gently
// nudge you in the evening if today's Guardian questions are still pending.
//
// Behaviour:
//   - Only runs in the browser (client component).
//   - Checks local time; only triggers if hour >= EVENING_START_HOUR.
//   - Checks localStorage "guardian_nudge_seen:YYYY-MM-DD" to avoid repeating.
//   - Calls /api/brain/checkins for today.
//   - If there are any "pending" check-ins, shows a small floating panel:
//       "You still have X questions for today" + button to open /guardian-today.
//
//   - "Not now" / "Got it" both mark today as seen and hide the nudge.
//
// It does NOT touch any database directly and can be removed without
// breaking Guardian.
export default function GuardianNudgeClient({ disabled }: Props) {
  const [visible, setVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [dateIso, setDateIso] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (disabled) {
      setChecking(false);
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < EVENING_START_HOUR) {
      // Only start nudging in the evening
      setChecking(false);
      return;
    }

    const { key, dateIso } = getTodayKey();
    setDateIso(dateIso);

    // If we've already shown (and dismissed) the nudge today, stop.
    if (typeof window !== 'undefined') {
      const seen = window.localStorage.getItem(key);
      if (seen === '1') {
        setChecking(false);
        return;
      }
    }

    const run = async () => {
      try {
        const res = await fetch('/api/brain/checkins?date=' + dateIso);
        const data = (await res.json()) as CheckinsResponse;
        if (!data.ok) {
          setChecking(false);
          return;
        }
        const checkins = data.checkins ?? [];
        const pending = checkins.filter((c) => c.status === 'pending').length;
        if (pending > 0) {
          setPendingCount(pending);
          setVisible(true);
        }
      } catch {
        // fail silent – nudge is optional
      } finally {
        setChecking(false);
      }
    };

    run();
  }, [disabled]);

  const markSeen = () => {
    if (typeof window !== 'undefined') {
      const { key } = getTodayKey();
      window.localStorage.setItem(key, '1');
    }
    setVisible(false);
  };

  if (!visible || checking) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-md rounded-xl border border-emerald-500/40 bg-black/80 px-4 py-3 shadow-lg backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-7 w-7 flex items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/10 text-[11px] font-semibold">
            G
          </div>
          <div className="flex-1 space-y-1 text-xs text-slate-50">
            <p className="text-[11px] uppercase tracking-wide text-emerald-300">
              Guardian · Today
            </p>
            <p className="text-sm font-medium">
              {pendingCount && pendingCount > 0
                ? `You still have ${pendingCount} question${pendingCount === 1 ? '' : 's'} for today.`
                : 'You still have pending questions for today.'}
            </p>
            <p className="text-[11px] opacity-80">
              Take a moment to answer water, study, and walk for{' '}
              {dateIso ?? 'today'}. This helps GAIA keep your day complete.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2 text-[11px]">
          <button
            type="button"
            onClick={markSeen}
            className="rounded-md border border-transparent px-2.5 py-1 hover:bg-white/5"
          >
            Not now
          </button>
          <a
            href="/guardian-today"
            onClick={markSeen}
            className="inline-flex items-center justify-center rounded-md border border-emerald-400 bg-emerald-500/10 px-2.5 py-1 font-medium hover:bg-emerald-500/20"
          >
            Open Guardian
          </a>
        </div>
      </div>
    </div>
  );
}
