'use client';

import { useEffect, useState } from 'react';

type GuardianCheckinType = 'water' | 'study' | 'walk';
type GuardianCheckinStatus = 'pending' | 'answered' | 'skipped';

interface GuardianDailyRun {
  id: string;
  run_date: string;
  created_at: string;
  meta_json?: any | null;
}

interface GuardianCheckinRecord {
  id: string;
  user_id: string | null;
  checkin_date: string;
  type: GuardianCheckinType;
  status: GuardianCheckinStatus;
  question: string;
  answer_json: any;
  created_at: string;
  updated_at: string;
}

interface RunsResponse {
  ok: boolean;
  runs: GuardianDailyRun[];
  error?: string;
}

interface RunResponse {
  ok: boolean;
  date: string | null;
  run?: GuardianDailyRun;
  created_checkins?: number;
  checkins?: GuardianCheckinRecord[];
  error?: string;
}

interface CheckinsResponse {
  ok: boolean;
  date: string | null;
  checkins: GuardianCheckinRecord[];
  error?: string;
}

interface AnswerResponse {
  ok: boolean;
  checkin?: GuardianCheckinRecord;
  error?: string;
}

export default function GuardianDebugPage() {
  const [runs, setRuns] = useState<GuardianDailyRun[]>([]);
  const [runsError, setRunsError] = useState<string | null>(null);
  const [loadingRuns, setLoadingRuns] = useState(false);

  const [runDate, setRunDate] = useState<string>('');
  const [runningBrain, setRunningBrain] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<string | null>(null);

  const [checkinsDate, setCheckinsDate] = useState<string>('');
  const [checkins, setCheckins] = useState<GuardianCheckinRecord[]>([]);
  const [checkinsError, setCheckinsError] = useState<string | null>(null);
  const [loadingCheckins, setLoadingCheckins] = useState(false);

  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    refreshRuns();
  }, []);

  const refreshRuns = async () => {
    setLoadingRuns(true);
    setRunsError(null);
    try {
      const res = await fetch('/api/brain/runs');
      const data = (await res.json()) as RunsResponse;
      if (!data.ok) {
        throw new Error(data.error || 'Failed to load runs');
      }
      setRuns(data.runs ?? []);
    } catch (err: any) {
      setRunsError(err?.message ?? 'Unknown error');
    } finally {
      setLoadingRuns(false);
    }
  };

  const runBrain = async () => {
    setRunningBrain(true);
    setLastRunResult(null);
    try {
      const body: any = {};
      if (runDate) body.date = runDate;
      const res = await fetch('/api/brain/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as RunResponse;
      if (!data.ok) {
        throw new Error(data.error || 'Failed to run Guardian Brain');
      }
      setLastRunResult(
        `Ran for ${data.date ?? 'unknown date'} · created ${data.created_checkins ?? 0} check-ins.`
      );
      // refresh runs + checkins for that date
      refreshRuns();
      if (data.date) {
        setCheckinsDate(data.date);
        await loadCheckins(data.date);
      }
    } catch (err: any) {
      setLastRunResult(err?.message ?? 'Unknown error while running Brain');
    } finally {
      setRunningBrain(false);
    }
  };

  const loadCheckins = async (date?: string) => {
    const target = date || checkinsDate;
    if (!target) return;
    setLoadingCheckins(true);
    setCheckinsError(null);
    try {
      const res = await fetch(`/api/brain/checkins?date=${target}`);
      const data = (await res.json()) as CheckinsResponse;
      if (!data.ok) {
        throw new Error(data.error || 'Failed to load check-ins');
      }
      setCheckins(data.checkins ?? []);
    } catch (err: any) {
      setCheckinsError(err?.message ?? 'Unknown error while loading check-ins');
      setCheckins([]);
    } finally {
      setLoadingCheckins(false);
    }
  };

  const handleDraftChange = (id: string, value: string) => {
    setAnswerDrafts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const updateCheckin = async (id: string, status: GuardianCheckinStatus) => {
    setUpdatingId(id);
    try {
      const draft = answerDrafts[id];
      const payload: any = { id, status };
      if (typeof draft !== 'undefined' && draft !== '') {
        payload.answer = { text: draft };
      }
      const res = await fetch('/api/brain/checkins/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as AnswerResponse;
      if (!data.ok) {
        throw new Error(data.error || 'Failed to update check-in');
      }
      // Reload check-ins
      if (checkinsDate) {
        await loadCheckins(checkinsDate);
      }
    } catch (err: any) {
      alert(err?.message ?? 'Unknown error while saving');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadgeClasses = (status: GuardianCheckinStatus) => {
    if (status === 'answered') {
      return 'inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium';
    }
    if (status === 'skipped') {
      return 'inline-flex items-center rounded-full border border-amber-500/60 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium';
    }
    return 'inline-flex items-center rounded-full border border-sky-500/60 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium';
  };

  const statusLabel = (status: GuardianCheckinStatus) => {
    if (status === 'answered') return 'Answered';
    if (status === 'skipped') return 'Skipped';
    return 'Pending';
  };

  const niceType = (type: GuardianCheckinType) => {
    if (type === 'water') return 'Water';
    if (type === 'study') return 'Study';
    if (type === 'walk') return 'Walk';
    return type;
  };

  return (
    <main className="min-h-screen px-4 py-8 flex flex-col items-center">
      <section className="w-full max-w-5xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            GAIA Guardian · Debug
          </h1>
          <p className="text-sm opacity-70">
            Internal tools for Guardian 4.0. Use this page to run the Brain for specific dates,
            inspect daily runs, and debug check-ins. This page is for you only and is not meant for
            the normal Dashboard flow.
          </p>
        </header>

        {/* Brain run controls */}
        <section className="rounded-md border bg-black/5 p-4 space-y-4">
          <h2 className="text-sm font-semibold">Run Brain for a date</h2>
          <p className="text-xs opacity-70">
            Choose a date (or leave empty for today) and click &quot;Run Brain&quot; to create daily
            questions (water, study, walk). Running again for the same date will not duplicate
            questions.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <label className="opacity-70">Date</label>
              <input
                type="date"
                value={runDate}
                onChange={(e) => setRunDate(e.target.value)}
                className="rounded-md border bg-black/5 px-2 py-1"
              />
            </div>
            <button
              type="button"
              onClick={runBrain}
              disabled={runningBrain}
              className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
            >
              {runningBrain ? 'Running…' : 'Run Brain'}
            </button>
            {lastRunResult && (
              <p className="text-xs opacity-80">
                {lastRunResult}
              </p>
            )}
          </div>
        </section>

        {/* Runs history */}
        <section className="rounded-md border bg-black/5 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Daily runs history</h2>
            <button
              type="button"
              onClick={refreshRuns}
              disabled={loadingRuns}
              className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
            >
              {loadingRuns ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          {runsError && (
            <p className="text-xs text-red-500">
              {runsError}
            </p>
          )}
          {runs.length === 0 && !runsError && (
            <p className="text-xs opacity-70">
              No Guardian runs recorded yet.
            </p>
          )}
          {runs.length > 0 && (
            <div className="max-h-64 overflow-auto rounded-md border bg-black/10">
              <table className="w-full text-[11px]">
                <thead className="bg-black/20">
                  <tr>
                    <th className="px-2 py-1 text-left font-medium">Date</th>
                    <th className="px-2 py-1 text-left font-medium">Created at</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} className="border-t border-white/5">
                      <td className="px-2 py-1">{r.run_date}</td>
                      <td className="px-2 py-1 opacity-70">{r.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Check-ins for a date */}
        <section className="rounded-md border bg-black/5 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">Check-ins for a date</h2>
              <p className="text-xs opacity-70">
                Load the check-ins for a specific day. You can also answer or skip them from here
                while debugging.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={checkinsDate}
                onChange={(e) => setCheckinsDate(e.target.value)}
                className="rounded-md border bg-black/5 px-2 py-1"
              />
              <button
                type="button"
                onClick={() => loadCheckins()}
                disabled={loadingCheckins || !checkinsDate}
                className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
              >
                {loadingCheckins ? 'Loading…' : 'Load'}
              </button>
            </div>
          </div>

          {checkinsError && (
            <p className="text-xs text-red-500">
              {checkinsError}
            </p>
          )}

          {checkins.length === 0 && !loadingCheckins && !checkinsError && checkinsDate && (
            <p className="text-xs opacity-70">
              No check-ins found for this date. Try running the Brain for this day above.
            </p>
          )}

          {checkins.length > 0 && (
            <div className="space-y-3">
              {checkins.map((c) => (
                <article
                  key={c.id}
                  className="rounded-md border bg-black/10 px-3 py-3 flex flex-col gap-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide opacity-60">
                        {niceType(c.type)}
                      </p>
                      <p className="text-sm font-medium">
                        {c.question}
                      </p>
                    </div>
                    <span className={statusBadgeClasses(c.status)}>
                      {statusLabel(c.status)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] opacity-70">
                      Answer draft (for testing)
                    </label>
                    <input
                      type="text"
                      value={answerDrafts[c.id] ?? ''}
                      onChange={(e) => handleDraftChange(c.id, e.target.value)}
                      placeholder={
                        c.type === 'water'
                          ? 'e.g. 1500 ml'
                          : c.type === 'walk'
                          ? 'e.g. 20 minutes'
                          : 'e.g. 45 minutes of study'
                      }
                      className="w-full rounded-md border bg-black/5 px-2 py-1 text-[11px]"
                    />
                    <p className="text-[11px] opacity-70">
                      Stored answer:{' '}
                      {c.answer_json == null
                        ? <span className="italic">(none yet)</span>
                        : <code className="break-all">
                            {JSON.stringify(c.answer_json)}
                          </code>}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => updateCheckin(c.id, 'answered')}
                      disabled={updatingId === c.id}
                      className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
                    >
                      {updatingId === c.id ? 'Saving…' : 'Mark answered'}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCheckin(c.id, 'skipped')}
                      disabled={updatingId === c.id}
                      className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
                    >
                      Skip
                    </button>
                  </div>
                  <p className="text-[11px] opacity-60">
                    id: <code>{c.id}</code>
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
