'use client';

import { useEffect, useState } from 'react';

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

interface CheckinsResponse {
  ok: boolean;
  date: string | null;
  checkins: GuardianCheckinRecord[];
  error?: string;
}

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

export default function GuardianTodayPage() {
  const [dateIso, setDateIso] = useState<string>('');
  const [checkins, setCheckins] = useState<GuardianCheckinRecord[]>([]);
  const [summary, setSummary] = useState<GuardianDaySummary | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});

  // Load today's check-ins and summary on first mount
  useEffect(() => {
    loadCheckinsAndSummary();
  }, []);

  const loadCheckinsAndSummary = async (targetDate?: string) => {
    const effectiveDate = targetDate || dateIso || '';
    await Promise.all([
      loadCheckins(effectiveDate || undefined),
      loadSummary(effectiveDate || undefined),
    ]);
  };

  const loadCheckins = async (targetDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = targetDate
        ? `/api/brain/checkins?date=${targetDate}`
        : '/api/brain/checkins';
      const res = await fetch(url);
      const data = (await res.json()) as CheckinsResponse;
      if (!data.ok) {
        throw new Error(data.error || 'Failed to load check-ins');
      }
      setCheckins(data.checkins ?? []);
      if (data.date) setDateIso(data.date);
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error');
      setCheckins([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async (targetDate?: string) => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const url = targetDate
        ? `/api/brain/summary?date=${targetDate}`
        : '/api/brain/summary';
      const res = await fetch(url);
      const data = (await res.json()) as SummaryResponse;
      if (!data.ok) {
        // We treat summary errors as soft; just show a small message.
        setSummary(null);
        setSummaryError(data.error || 'Failed to load summary');
        return;
      }
      setSummary(data.summary);
    } catch (err: any) {
      setSummary(null);
      setSummaryError(err?.message ?? 'Failed to load summary');
    } finally {
      setLoadingSummary(false);
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
    setError(null);
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
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to update check-in');
      }

      // Reload check-ins and summary for current date
      if (dateIso) {
        await loadCheckinsAndSummary(dateIso);
      } else {
        await loadCheckinsAndSummary();
      }
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error while saving');
    } finally {
      setUpdatingId(null);
    }
  };

  const niceLabelForType = (type: GuardianCheckinType) => {
    if (type === 'water') return 'Water';
    if (type === 'study') return 'Study';
    if (type === 'walk') return 'Walk';
    return type;
  };

  const statusBadgeClasses = (status: GuardianCheckinStatus) => {
    if (status === 'answered') {
      return 'inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium';
    }
    if (status === 'skipped') {
      return 'inline-flex items-center rounded-full border border-amber-500/60 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium';
    }
    // pending
    return 'inline-flex items-center rounded-full border border-sky-500/60 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium';
  };

  const statusLabel = (status: GuardianCheckinStatus) => {
    if (status === 'answered') return 'Answered';
    if (status === 'skipped') return 'Skipped';
    return 'Pending';
  };

  const todayDisplay = dateIso || 'Today';

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      <section className="w-full max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            GAIA Guardian · Today
          </h1>
          <p className="text-sm opacity-70">
            A small, user-facing view of your daily questions (water, study, walk). This page uses
            the same Brain check-ins that you saw in <code>/guardian-debug</code>, but in a calmer,
            dashboard-friendly layout.
          </p>
        </header>

        {/* Day picker + overall summary */}
        <section className="rounded-md border bg-black/5 p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide opacity-60">
                Day in focus
              </p>
              <p className="text-lg font-medium">
                {todayDisplay}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={dateIso}
                onChange={(e) => setDateIso(e.target.value)}
                className="rounded-md border bg-black/5 px-2 py-1"
              />
              <button
                type="button"
                onClick={() => loadCheckinsAndSummary(dateIso || undefined)}
                disabled={loading || loadingSummary}
                className="inline-flex items-center justify-center rounded-md border px-2.5 py-1 font-medium shadow-sm hover:bg-black/5 disabled:opacity-60"
              >
                {loading || loadingSummary ? 'Loading…' : 'Load'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600">
              Error: {error}
            </p>
          )}

          {summary && (
            <div className="rounded-md border bg-black/10 p-3 space-y-1 text-xs">
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

          {summaryError && (
            <p className="text-[11px] text-amber-500">
              Summary issue: {summaryError}
            </p>
          )}

          {checkins.length === 0 && !loading ? (
            <p className="text-sm opacity-70">
              No check-ins found for this date. Try running the Brain for this day from{' '}
              <code>/guardian-debug</code> first.
            </p>
          ) : null}
        </section>

        {checkins.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold opacity-80">
              Today&apos;s questions
            </h2>
            <div className="space-y-3">
              {checkins.map((c) => (
                <article
                  key={c.id}
                  className="rounded-lg border bg-black/5 px-3 py-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs uppercase tracking-wide opacity-60">
                        {niceLabelForType(c.type)}
                      </p>
                      <p className="text-sm font-medium">
                        {c.question}
                      </p>
                    </div>
                    <span className={statusBadgeClasses(c.status)}>
                      {statusLabel(c.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="block text-[11px] opacity-70">
                      Your answer (optional)
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
                    <div className="text-[11px] opacity-70">
                      Stored answer:{' '}
                      {c.answer_json == null
                        ? <span className="italic">(none yet)</span>
                        : <code className="break-all">
                            {JSON.stringify(c.answer_json)}
                          </code>}
                    </div>
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
                      Skip today
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <p className="text-[11px] opacity-60">
              In a future Dashboard version, a compact card can reuse this same logic to nudge you
              at the end of the day. For now, this page acts as a safe, user-facing prototype
              without touching your existing Dashboard layout.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
