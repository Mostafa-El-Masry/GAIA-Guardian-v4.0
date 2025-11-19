'use client';

import { useEffect, useState } from 'react';

type GuardianCheckinType = 'water' | 'study' | 'walk';
type GuardianCheckinStatus = 'pending' | 'answered' | 'skipped';

interface GuardianDaySummary {
  date: string;
  total: number;
  answered: number;
  pending: number;
  skipped: number;
  waterStatus?: GuardianCheckinStatus;
  studyStatus?: GuardianCheckinStatus;
  walkStatus?: GuardianCheckinStatus;
  headline: string;
  detailLines: string[];
}

interface SummaryResponse {
  ok: boolean;
  date: string | null;
  summary: GuardianDaySummary | null;
  error?: string;
}

interface CheckinsResponse {
  ok: boolean;
  date: string | null;
  checkins: {
    id: string;
    type: GuardianCheckinType;
    status: GuardianCheckinStatus;
  }[];
  error?: string;
}

// GAIA Guardian · TodayCard (4.0)
//
// Small dashboard-friendly card that shows a compact view of today's
// Brain status. It is meant to be dropped into your existing Dashboard
// without changing its layout.
//
// Usage (example):
//   import GuardianTodayCard from '@/components/guardian/GuardianTodayCard';
//   ...
/*   <GuardianTodayCard className="w-full md:w-1/3" /> */

interface Props {
  className?: string;
}

export default function GuardianTodayCard({ className = '' }: Props) {
  const [summary, setSummary] = useState<GuardianDaySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tiny extra: show how many check-ins are still pending
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) Fetch summary
      const sRes = await fetch('/api/brain/summary');
      const sData = (await sRes.json()) as SummaryResponse;
      if (!sData.ok) {
        throw new Error(sData.error || 'Failed to load summary');
      }
      setSummary(sData.summary);

      // 2) Fetch check-ins but only to know pending count
      const cRes = await fetch('/api/brain/checkins');
      const cData = (await cRes.json()) as CheckinsResponse;
      if (!cData.ok) {
        // Not critical – we can still show the summary
        setPendingCount(null);
      } else {
        const pending = (cData.checkins ?? []).filter(
          (c) => c.status === 'pending'
        ).length;
        setPendingCount(pending);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error');
      setSummary(null);
      setPendingCount(null);
    } finally {
      setLoading(false);
    }
  };

  const pillForStatus = (label: string, status?: GuardianCheckinStatus) => {
    if (!status) return null;
    let base = 'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium';
    if (status === 'answered') {
      base += ' border-emerald-500/60 bg-emerald-500/10';
    } else if (status === 'skipped') {
      base += ' border-amber-500/60 bg-amber-500/10';
    } else {
      base += ' border-sky-500/60 bg-sky-500/10';
    }
    const text =
      status === 'answered'
        ? 'done'
        : status === 'skipped'
        ? 'skipped'
        : 'pending';
    return (
      <span className={base}>
        {label}: {text}
      </span>
    );
  };

  return (
    <section
      className={`rounded-xl border bg-black/5 p-4 shadow-sm flex flex-col gap-3 ${className}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wide opacity-60">
            Guardian · Today
          </p>
          <h2 className="text-sm font-semibold">
            Daily questions
          </h2>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-[11px] font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {error && (
        <p className="text-[11px] text-red-500">
          {error}
        </p>
      )}

      {!summary && !error && (
        <p className="text-[11px] opacity-70">
          No summary yet. Try running the Brain from <code>/guardian-debug</code> for today.
        </p>
      )}

      {summary && (
        <div className="space-y-2 text-[11px]">
          <p className="font-medium">
            {summary.headline}
          </p>
          <ul className="list-disc pl-4 space-y-0.5 opacity-80">
            {summary.detailLines.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-[10px] mt-1">
        {summary && (
          <>
            {pillForStatus('Water', summary.waterStatus)}
            {pillForStatus('Study', summary.studyStatus)}
            {pillForStatus('Walk', summary.walkStatus)}
          </>
        )}
      </div>

      <footer className="mt-2 flex items-center justify-between gap-3 text-[10px] opacity-70">
        <div>
          {pendingCount != null ? (
            <span>
              Pending today: <span className="font-semibold">{pendingCount}</span>
            </span>
          ) : (
            <span>Pending today: ·</span>
          )}
        </div>
        <a
          href="/guardian-today"
          className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium hover:bg-black/5"
        >
          Open full view
        </a>
      </footer>
    </section>
  );
}
