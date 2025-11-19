'use client';

import { useEffect, useState } from 'react';

interface BrainResult {
  ok: boolean;
  ranAt: string;
  targetDate: string;
  notes: string[];
}

interface GuardianDailyRunRecord {
  id: string;
  user_id: string | null;
  run_date: string;
  ran_at: string;
  notes: string[];
  created_at: string;
}

type GuardianCheckinType = 'water' | 'study' | 'walk';
type GuardianCheckinStatus = 'pending' | 'answered' | 'skipped';

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

export default function GuardianDebugPage() {
  const [result, setResult] = useState<BrainResult | null>(null);
  const [history, setHistory] = useState<GuardianDailyRunRecord[]>([]);
  const [checkins, setCheckins] = useState<GuardianCheckinRecord[]>([]);

  const [loadingRun, setLoadingRun] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingCheckins, setLoadingCheckins] = useState(false);
  const [updatingCheckinId, setUpdatingCheckinId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [checkinsError, setCheckinsError] = useState<string | null>(null);

  const [runDate, setRunDate] = useState<string>('');
  const [checkinsDate, setCheckinsDate] = useState<string>('');

  // Local draft answers per check-in id
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const res = await fetch('/api/brain/history');
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'Unknown history error');
      }
      setHistory(data.runs ?? []);
    } catch (err: any) {
      setHistoryError(err?.message ?? 'Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchCheckins = async (dateOverride?: string) => {
    setLoadingCheckins(true);
    setCheckinsError(null);
    try {
      const param = dateOverride || checkinsDate;
      const url = param ? `/api/brain/checkins?date=${param}` : '/api/brain/checkins';
      const res = await fetch(url);
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'Unknown check-ins error');
      }
      setCheckins(data.checkins ?? []);
      if (!dateOverride && !checkinsDate && data.date) {
        setCheckinsDate(data.date);
      }
    } catch (err: any) {
      setCheckinsError(err?.message ?? 'Failed to load check-ins');
    } finally {
      setLoadingCheckins(false);
    }
  };

  useEffect(() => {
    // Load history and today's check-ins on first visit
    fetchHistory();
    fetchCheckins();
  }, []);

  const runBrainToday = async () => {
    setLoadingRun(true);
    setError(null);
    try {
      const res = await fetch('/api/brain/run');
      if (!res.ok) {
        throw new Error('Request failed with status ' + res.status);
      }
      const data = (await res.json()) as BrainResult;
      setResult(data);
      fetchHistory();
      const dateOnly = data.targetDate.slice(0, 10);
      fetchCheckins(dateOnly);
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error');
      setResult(null);
    } finally {
      setLoadingRun(false);
    }
  };

  const runBrainForDate = async () => {
    if (!runDate) {
      setError('Please pick a date first.');
      return;
    }
    setLoadingRun(true);
    setError(null);
    try {
      const res = await fetch('/api/brain/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: runDate }),
      });
      if (!res.ok) {
        throw new Error('Request failed with status ' + res.status);
      }
      const data = (await res.json()) as BrainResult;
      setResult(data);
      fetchHistory();
      const dateOnly = data.targetDate.slice(0, 10);
      fetchCheckins(dateOnly);
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error');
      setResult(null);
    } finally {
      setLoadingRun(false);
    }
  };

  const updateCheckin = async (
    id: string,
    status: GuardianCheckinStatus,
  ) => {
    setUpdatingCheckinId(id);
    setCheckinsError(null);
    try {
      const draft = answerDrafts[id];
      const payload: any = { id, status };

      if (typeof draft !== 'undefined' && draft !== '') {
        // Store a generic object; later we can specialize per type
        payload.answer = { text: draft };
      }

      const res = await fetch('/api/brain/checkins/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'Unknown update error');
      }

      // Refresh check-ins for the current date
      const date = checkinsDate || (checkins[0]?.checkin_date ?? '');
      fetchCheckins(date);
    } catch (err: any) {
      setCheckinsError(err?.message ?? 'Failed to update check-in');
    } finally {
      setUpdatingCheckinId(null);
    }
  };

  const handleDraftChange = (id: string, value: string) => {
    setAnswerDrafts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <section className="w-full max-w-4xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            GAIA Guardian · Brain Debug
          </h1>
          <p className="text-sm opacity-70">
            Week 6 – Brain logs daily runs, creates daily check-ins, and this page lets you
            inspect and answer those questions. Dev-only view; your main UI is still untouched.
          </p>
        </header>

        {/* Controls */}
        <section className="space-y-4 rounded-md border bg-black/5 p-4">
          <h2 className="text-sm font-semibold">Run Brain</h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runBrainToday}
              disabled={loadingRun}
              className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
            >
              {loadingRun ? 'Running…' : 'Run for today'}
            </button>

            <div className="flex items-center gap-2 text-sm">
              <label className="text-xs opacity-80" htmlFor="run-date">
                or pick date
              </label>
              <input
                id="run-date"
                type="date"
                value={runDate}
                onChange={(e) => setRunDate(e.target.value)}
                className="rounded-md border bg-black/5 px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={runBrainForDate}
                disabled={loadingRun}
                className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
              >
                Run for chosen date
              </button>
            </div>

            {error && <p className="text-xs text-red-600">Error: {error}</p>}
          </div>

          <div className="rounded-md border bg-black/5 p-3 text-xs overflow-x-auto">
            {result ? (
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <span className="opacity-60">
                No runs yet in this session. Use the buttons above to trigger the Brain.
              </span>
            )}
          </div>
        </section>

        {/* History */}
        <section className="space-y-3 rounded-md border bg-black/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Recent Brain Runs</h2>
            <button
              type="button"
              onClick={fetchHistory}
              disabled={loadingHistory}
              className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
            >
              {loadingHistory ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {historyError && (
            <p className="text-xs text-red-600">History error: {historyError}</p>
          )}

          {history.length === 0 ? (
            <p className="text-xs opacity-60">
              No Brain runs found in the guardian_daily_runs table yet.
            </p>
          ) : (
            <div className="max-h-64 overflow-auto rounded-md border bg-black/5">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-black/10">
                  <tr>
                    <th className="border px-2 py-1 text-left">Date</th>
                    <th className="border px-2 py-1 text-left">Ran at</th>
                    <th className="border px-2 py-1 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((run) => (
                    <tr key={run.id} className="align-top">
                      <td className="border px-2 py-1 whitespace-nowrap">
                        {run.run_date}
                      </td>
                      <td className="border px-2 py-1 whitespace-nowrap">
                        {new Date(run.ran_at).toLocaleString()}
                      </td>
                      <td className="border px-2 py-1">
                        <ul className="list-disc pl-4 space-y-0.5">
                          {run.notes?.map((note, idx) => (
                            <li key={idx}>{note}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-[11px] opacity-60">
            This history is limited to the last 30 runs for now. Later, parts of this view can
            move into your main Dashboard as a small "Brain activity" card.
          </p>
        </section>

        {/* Check-ins */}
        <section className="space-y-3 rounded-md border bg-black/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Daily Check-ins (debug)</h2>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={checkinsDate}
                onChange={(e) => setCheckinsDate(e.target.value)}
                className="rounded-md border bg-black/5 px-2 py-1"
              />
              <button
                type="button"
                onClick={() => fetchCheckins()}
                disabled={loadingCheckins}
                className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
              >
                {loadingCheckins ? 'Loading…' : 'Load check-ins'}
              </button>
            </div>
          </div>

          {checkinsError && (
            <p className="text-xs text-red-600">Check-ins error: {checkinsError}</p>
          )}

          {checkins.length === 0 ? (
            <p className="text-xs opacity-60">
              No check-ins found for the selected date yet. Try running the Brain for that date
              above.
            </p>
          ) : (
            <div className="max-h-72 overflow-auto rounded-md border bg-black/5">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-black/10">
                  <tr>
                    <th className="border px-2 py-1 text-left">Type</th>
                    <th className="border px-2 py-1 text-left">Status</th>
                    <th className="border px-2 py-1 text-left">Question</th>
                    <th className="border px-2 py-1 text-left">Answer</th>
                    <th className="border px-2 py-1 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {checkins.map((c) => (
                    <tr key={c.id} className="align-top">
                      <td className="border px-2 py-1 whitespace-nowrap">{c.type}</td>
                      <td className="border px-2 py-1 whitespace-nowrap">{c.status}</td>
                      <td className="border px-2 py-1">{c.question}</td>
                      <td className="border px-2 py-1">
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={answerDrafts[c.id] ?? ''}
                            onChange={(e) => handleDraftChange(c.id, e.target.value)}
                            placeholder="Type answer (optional)"
                            className="w-full rounded-md border bg-black/5 px-2 py-1 text-[11px]"
                          />
                          <pre className="whitespace-pre-wrap break-all opacity-70 text-[11px]">
                            {c.answer_json == null
                              ? '(no stored answer yet)'
                              : JSON.stringify(c.answer_json, null, 2)}
                          </pre>
                        </div>
                      </td>
                      <td className="border px-2 py-1 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => updateCheckin(c.id, 'answered')}
                            disabled={updatingCheckinId === c.id}
                            className="rounded-md border px-2 py-0.5 text-[11px] font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
                          >
                            {updatingCheckinId === c.id ? 'Saving…' : 'Mark answered'}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCheckin(c.id, 'skipped')}
                            disabled={updatingCheckinId === c.id}
                            className="rounded-md border px-2 py-0.5 text-[11px] font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
                          >
                            Skip
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-[11px] opacity-60">
            Later, these check-ins (types + status + answers) will feed directly into your main
            Dashboard&apos;s end-of-day prompts and summaries. For now, this page is your lab for
            shaping that behavior without risking the real UI.
          </p>
        </section>
      </section>
    </main>
  );
}
