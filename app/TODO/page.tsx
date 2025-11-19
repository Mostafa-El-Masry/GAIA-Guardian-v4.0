// app/TODO/page.tsx
"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useTodoDaily } from "../dashboard/hooks/useTodoDaily";
import type { Task, Category } from "../dashboard/hooks/useTodoDaily";
import {
  snapshotStorage,
  waitForUserStorage,
  subscribe,
} from "@/lib/user-storage";

type StatusTone = "pending" | "done" | "skipped";
type StatusResolution = { label: string; tone: StatusTone; dateLabel: string };

const LABELS: Record<Category, string> = {
  life: "Life",
  work: "Work",
  distraction: "Distraction",
};

const HINTS: Record<Category, string> = {
  life: "Use this for home, errands, relationships, errands, and anything that keeps your life moving.",
  work: "Tasks related to your job, GAIA building, study sessions, and deep work blocks.",
  distraction: "Things you want to deliberately enjoy or limit: games, scrolling, and time sinks.",
};

const CATEGORY_ORDER: Category[] = ["life", "work", "distraction"];
const EMPTY_DRAFTS: Record<Category, string> = {
  life: "",
  work: "",
  distraction: "",
};

function formatShortDate(value?: string | null) {
  if (!value || value === "Unscheduled") return value ?? "Unscheduled";
  try {
    const date = new Date(value + "T00:00:00Z");
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return value;
  }
}

export default function TODOPage() {
  const { tasks, deleteTask, addQuickTask, editTask, setTaskStatus } = useTodoDaily();
  const [storageStatus, setStorageStatus] = useState({ synced: false, hasTasks: false });
  const [drafts, setDrafts] = useState<Record<Category, string>>(EMPTY_DRAFTS);

  useEffect(() => {
    let cancelled = false;
    const update = () => {
      const snapshot = snapshotStorage();
      const hasSupabase = snapshot["gaia.todo.supabase.synced"] === "true";
      const localRaw = snapshot["gaia.todo.v2.0.6"];
      const hasTasks =
        typeof localRaw === "string" && !localRaw.includes('"tasks":[]');
      setStorageStatus({ synced: hasSupabase, hasTasks });
    };
    (async () => {
      try {
        await waitForUserStorage();
        if (cancelled) return;
        update();
      } catch {
        if (!cancelled) setStorageStatus({ synced: false, hasTasks: false });
      }
    })();
    const unsub = subscribe(({ key }) => {
      if (!key) return;
      if (key.startsWith("gaia.todo")) update();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const byCat = useMemo(() => {
    const map: Record<Category, Task[]> = { life: [], work: [], distraction: [] };
    for (const t of tasks) map[t.category].push(t);
    return map;
  }, [tasks]);

  const resolveStatus = useCallback((task: Task): StatusResolution => {
    const entries = Object.entries(task.status_by_date ?? {});
    if (entries.length === 0) {
      return {
        label: "Pending",
        tone: "pending",
        dateLabel: task.due_date ?? "Unscheduled",
      };
    }
    entries.sort((a, b) => b[0].localeCompare(a[0]));
    const [date, status] = entries[0];
    return {
      label: status === "done" ? "Done" : "Skipped",
      tone: status === "done" ? "done" : "skipped",
      dateLabel: date,
    };
  }, []);

  const toneStyles: Record<StatusTone, string> = {
    pending:
      "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-400/20 dark:text-amber-200 dark:border-amber-400/30",
    done: "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-400/20 dark:text-emerald-100 dark:border-emerald-400/30",
    skipped:
      "bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-600/30 dark:text-slate-200 dark:border-slate-500",
  };

  const handleAdd = useCallback(
    async (category: Category) => {
      const title = drafts[category]?.trim();
      if (!title) return;
      try {
        await addQuickTask(category, title);
      } finally {
        setDrafts((prev) => ({ ...prev, [category]: "" }));
      }
    },
    [addQuickTask, drafts]
  );

  const handleDateChange = useCallback(
    (taskId: string, nextValue: string) => {
      const normalized = nextValue.trim();
      editTask(taskId, { due_date: normalized ? normalized : null });
    },
    [editTask]
  );

  const handleStatusChange = useCallback(
    (task: Task, date: string | null, next: StatusTone) => {
      if (!date || date === "Unscheduled") return;
      setTaskStatus(task.id, date, next);
    },
    [setTaskStatus]
  );

  return (
    <main className="mx-auto max-w-4xl p-4">
      <header className="mb-6 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">TODO {"\u2014"} All Tasks</h1>
          <span className="inline-flex items-center gap-2 rounded-full border border-base-300/70 px-3 py-1 text-xs text-base-content/70">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: storageStatus.synced ? "var(--gaia-positive)" : "var(--gaia-warning)" }} />
            {storageStatus.synced ? "Backed up to Supabase" : "Local only"}
          </span>
          <span className="text-xs text-base-content/60">
            Local cache {storageStatus.hasTasks ? "present" : "empty"}
          </span>
        </div>
        <p className="max-w-2xl text-sm text-base-content/70">
          This is the full list backing the dashboard&apos;s &quot;Today&apos;s Focus&quot; panel. Tasks are grouped by Life, Work, and Distraction so you can see everything in one place.
        </p>
      </header>

      {CATEGORY_ORDER.map((cat) => (
        <section key={cat} className="mb-8">
          <header className="mb-2 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">{LABELS[cat]}</h2>
            <p className="text-xs text-base-content/60">{HINTS[cat]}</p>
          </header>

          <div className="rounded-xl border border-base-300 bg-base-100/60">
                {byCat[cat].length === 0 ? (
                  <div className="space-y-1 p-4 text-sm text-base-content/60">
                    <p>No tasks in this category yet.</p>
                    <p>
                  Add one below or from the dashboard&apos;s &quot;Today&apos;s Focus&quot; cards using Quick Add, and
                  they&apos;ll sync here automatically.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-base-300">
                {byCat[cat].map((t) => {
                  const statusMeta = resolveStatus(t);
                  const statusDate =
                    (statusMeta.dateLabel !== "Unscheduled" && statusMeta.dateLabel) ||
                    t.due_date ||
                    null;
                  const friendlyDue = formatShortDate(t.due_date);

                  return (
                    <li key={t.id} className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-medium">{t.title}</div>
                          {t.note && (
                            <p className="text-sm text-base-content/70">{t.note}</p>
                          )}
                          {t.repeat && t.repeat !== "none" && (
                            <p className="mt-1 text-xs uppercase tracking-wide text-base-content/60">
                              Repeats: {String(t.repeat)}
                            </p>
                          )}

                          <StatusRow task={t} toneStyles={toneStyles} status={statusMeta} />
                          <p className="mt-1 text-xs text-base-content/60">
                            Due: {friendlyDue}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-base-content/70">
                            <label className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-50 px-3 py-2 text-xs font-medium">
                              <span>Due date</span>
                              <input
                                type="date"
                                className="rounded border border-base-200 bg-base-100 px-2 py-1 text-base-content"
                                value={t.due_date ?? ""}
                                onChange={(e) => handleDateChange(t.id, e.target.value)}
                              />
                            </label>
                            <label className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-50 px-3 py-2 text-xs font-medium">
                              <span>Status</span>
                              <select
                                className="rounded border border-base-200 bg-base-100 px-2 py-1 text-base-content"
                                value={statusMeta.tone}
                                disabled={!statusDate}
                                onChange={(e) =>
                                  handleStatusChange(t, statusDate, e.target.value as StatusTone)
                                }
                              >
                                <option value="pending">Pending</option>
                                <option value="done">Done</option>
                                <option value="skipped">Skipped</option>
                              </select>
                            </label>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-lg border border-base-300 px-2 py-1 text-xs text-base-content/70 hover:bg-base-200"
                            onClick={() => deleteTask(t.id)}
                            title="Delete task"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <form
              className="flex flex-wrap items-center gap-2 border-t border-base-300 bg-base-50/70 p-3 text-sm"
              onSubmit={(e) => {
                e.preventDefault();
                void handleAdd(cat);
              }}
            >
              <label className="sr-only" htmlFor={`todo-add-${cat}`}>
                Add {LABELS[cat]} task
              </label>
              <input
                id={`todo-add-${cat}`}
                className="flex-1 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content placeholder:text-base-content/40"
                placeholder={`Add a ${LABELS[cat]} task...`}
                value={drafts[cat]}
                onChange={(e) =>
                  setDrafts((prev) => ({ ...prev, [cat]: e.target.value }))
                }
              />
              <button
                type="submit"
                className="rounded-lg bg-base-content px-4 py-2 text-sm font-semibold text-base-100 transition hover:opacity-90 disabled:opacity-40"
                disabled={!drafts[cat].trim()}
              >
                Add
              </button>
            </form>
          </div>
        </section>
      ))}
    </main>
  );
}

type StatusRowProps = {
  task: Task;
  toneStyles: Record<StatusTone, string>;
  status: StatusResolution;
};

function StatusRow({ task, toneStyles, status }: StatusRowProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2 text-xs">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${toneStyles[status.tone]}`}
      >
        Status: {status.label}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-base-300/60 px-2 py-0.5 text-base-content/70">
        Date: {formatShortDate(status.dateLabel)}
      </span>
      {task.due_date && task.due_date !== status.dateLabel && (
        <span className="inline-flex items-center gap-1 rounded-full border border-base-300/60 px-2 py-0.5 text-base-content/70">
          Due: {formatShortDate(task.due_date)}
        </span>
      )}
    </div>
  );
}
