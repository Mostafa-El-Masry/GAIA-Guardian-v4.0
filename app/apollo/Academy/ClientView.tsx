"use client";

import { useEffect, useState } from "react";

type ArcConfig = {
  id: string;
  label: string;
  title: string;
  focus: string;
  estimatedDuration: string;
  approxLessons: string;
};

type ArcDayRange = {
  arcId: ArcConfig["id"];
  start: number;
  end: number;
};

type StudyEngineState = {
  classId: string;
  currentDayIndex: number;
  completedDays: number;
  backlogDays: number;
  aheadDays: number;
  streak: number;
  totalPlannedDays: number;
};

type StudyEngineSnapshot = {
  version: string;
  state: StudyEngineState;
  todayArc:
    | {
        arcId: string;
        label: string;
        title: string;
        dayIndexWithinArc: number;
        totalDaysInArc: number;
      }
    | null;
};

// This represents the shape of a future Supabase row for this engine.
// It is not used at runtime yet, but documents how persistence will look.
type StudyEngineRow = {
  id: string; // uuid
  userId: string; // uuid or auth uid
  classId: string; // e.g. "web-awakening-line-01"
  snapshot: StudyEngineSnapshot; // JSONB column
  updatedAt: string; // ISO timestamp
};

const CLASS_ID = "web-awakening-line-01";
const CLASS_NAME = "Web Awakening - From Zero to Web Crafter";
const STUDY_ENGINE_VERSION = "1.0.0";
const TOTAL_PLANNED_DAYS = 200;
const LOCAL_STORAGE_KEY = "gaia:web-awakening:study-engine";

const CLASS_GOAL =
  "Take Mustafa from \"I feel like a noob\" to \"I can design and build clean, responsive, interactive websites and small web apps on my own, using HTML, CSS, JavaScript and basic React.\"";

const arcs: ArcConfig[] = [
  {
    id: "arc-1-grounding",
    label: "Arc 1",
    title: "Grounding",
    focus:
      "Tools + HTML + very basic CSS. Understanding what the web is and how pages are built from the ground up.",
    estimatedDuration: "4-6 weeks",
    approxLessons: "20-25 lessons",
  },
  {
    id: "arc-2-layout-style",
    label: "Arc 2",
    title: "Layout & Style",
    focus:
      "Layout systems, CSS, and responsive design. Making pages actually look good and adapt to different screens.",
    estimatedDuration: "4-6 weeks",
    approxLessons: "20-25 lessons",
  },
  {
    id: "arc-3-movement",
    label: "Arc 3",
    title: "Movement",
    focus:
      "JavaScript basics plus DOM manipulation. Turning static pages into interactive experiences.",
    estimatedDuration: "6-8 weeks",
    approxLessons: "25-30 lessons",
  },
  {
    id: "arc-4-components",
    label: "Arc 4",
    title: "Components",
    focus:
      "React core: components, props, state, and simple hooks. Thinking in reusable, composable pieces.",
    estimatedDuration: "8-10 weeks",
    approxLessons: "30-35 lessons",
  },
  {
    id: "arc-5-apps",
    label: "Arc 5",
    title: "Apps",
    focus:
      "From components to small apps: multi-section React apps with basic navigation and state flow.",
    estimatedDuration: "10-12 weeks",
    approxLessons: "35-40 lessons",
  },
  {
    id: "arc-6-craft",
    label: "Craft",
    title: "Craft",
    focus:
      "Design, UX, accessibility, and performance. Making your projects feel professional and pleasant to use.",
    estimatedDuration: "8-10 weeks",
    approxLessons: "25-30 lessons",
  },
  {
    id: "arc-7-systems",
    label: "Systems",
    title: "Systems",
    focus:
      "Full-stack basics and architecture: backend, database, auth, and structuring bigger apps.",
    estimatedDuration: "12-16 weeks (ongoing)",
    approxLessons: "30-40 lessons",
  },
];

// Week 7: local persistence.
// We keep everything from Week 6, and add:
// - load from localStorage on first client render
// - save to localStorage whenever state changes
// This makes the Study Engine "real" for you on this device,
// while Supabase sync remains a future step.

const arcDayRanges: ArcDayRange[] = [
  { arcId: "arc-1-grounding", start: 1, end: 28 },
  { arcId: "arc-2-layout-style", start: 29, end: 56 },
  { arcId: "arc-3-movement", start: 57, end: 88 },
  { arcId: "arc-4-components", start: 89, end: 124 },
  { arcId: "arc-5-apps", start: 125, end: 160 },
  { arcId: "arc-6-craft", start: 161, end: 184 },
  { arcId: "arc-7-systems", start: 185, end: 200 },
];

function clampDay(value: number) {
  if (value < 1) return 1;
  if (value > TOTAL_PLANNED_DAYS) return TOTAL_PLANNED_DAYS;
  return value;
}

function getArcForDayIndex(dayIndex: number) {
  const clamped = clampDay(dayIndex);
  const range = arcDayRanges.find(
    (r) => clamped >= r.start && clamped <= r.end
  );
  if (!range) return null;
  const arc = arcs.find((a) => a.id === range.arcId);
  if (!arc) return null;

  const totalDaysInArc = range.end - range.start + 1;
  const dayIndexWithinArc = clamped - range.start + 1;

  return { arc, totalDaysInArc, dayIndexWithinArc, range };
}

function getDailyMessage(options: {
  currentDayIndex: number;
  backlogDays: number;
  aheadDays: number;
  completedDays: number;
  arcLabel: string;
  arcTitle: string;
}) {
  const {
    currentDayIndex,
    backlogDays,
    aheadDays,
    completedDays,
    arcLabel,
    arcTitle,
  } = options;

  const baseIntro =
    "Mustafa, welcome back to Web Awakening - From Zero to Web Crafter.";
  const dayLine = `You are currently at Study Day ${currentDayIndex} of about ${TOTAL_PLANNED_DAYS} planned days for this class.`;
  const arcLine = `Today's Study Day lives in ${arcLabel} - ${arcTitle}.`;

  const parts: string[] = [baseIntro, dayLine, arcLine];

  if (completedDays === 0) {
    parts.push(
      "This is your very first Study Day here. We will start gently and build momentum over time."
    );
  } else if (completedDays < 40) {
    parts.push(
      "You are still early in the journey. Each Study Day you complete now is building the foundation the rest of the class will stand on."
    );
  } else if (completedDays < 120) {
    parts.push(
      "You are deep into the core of this class. Small, consistent steps now matter more than perfection."
    );
  } else {
    parts.push(
      "You are in the advanced stretch of this class. Most people never get this far. The goal now is steady, sustainable progress."
    );
  }

  if (backlogDays === 0 && aheadDays === 0) {
    parts.push(
      "You have no backlog days and you are not working ahead. Today is a clean, on-time Study Day."
    );
  } else if (backlogDays > 0 && aheadDays === 0) {
    parts.push(
      `You currently have ${backlogDays} backlog day${
        backlogDays === 1 ? "" : "s"
      }. For today, we will treat this Study Day as your primary focus; if you still have energy afterwards, you can clear one extra backlog day.`
    );
  } else if (backlogDays === 0 && aheadDays > 0) {
    parts.push(
      `You are ${aheadDays} Study Day${
        aheadDays === 1 ? "" : "s"
      } ahead of schedule. You can simply complete today's plan, or choose to coast for a while when life gets heavier.`
    );
  } else if (backlogDays > 0 && aheadDays > 0) {
    parts.push(
      `You have a mixed state: ${backlogDays} backlog day${
        backlogDays === 1 ? "" : "s"
      } and ${aheadDays} ahead day${aheadDays === 1 ? "" : "s"}. The plan is to gently reduce backlog first, and treat your ahead days as a cushion rather than pressure.`
    );
  }

  parts.push(
    "Recommendation for today: complete one Study Day with full attention. Anything extra you do - catching up backlog or working ahead - is a bonus, not an obligation."
  );

  return parts.join(" ");
}

const SUPABASE_SCHEMA_HINT = `
-- Suggested table for the Study Engine state per learning class
create table if not exists study_engine_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, -- link to your auth.users or profiles table
  class_id text not null, -- e.g. 'web-awakening-line-01'
  snapshot jsonb not null, -- StudyEngineSnapshot
  updated_at timestamptz not null default now(),
  unique (user_id, class_id)
);

-- Minimal read pattern (pseudo-code):
-- select snapshot from study_engine_states
--  where user_id = :userId and class_id = :classId
--  limit 1;

-- Minimal upsert pattern (pseudo-code):
-- insert into study_engine_states (user_id, class_id, snapshot)
-- values (:userId, :classId, :snapshot)
-- on conflict (user_id, class_id)
-- do update set snapshot = excluded.snapshot, updated_at = now();
`;

export default function ClientView() {
  const [currentDayIndex, setCurrentDayIndex] = useState(1); // 1-200
  const [completedDays, setCompletedDays] = useState(0);
  const [backlogDays, setBacklogDays] = useState(0);
  const [aheadDays, setAheadDays] = useState(0);
  const [streak, setStreak] = useState(0);

  const [loadedFromCache, setLoadedFromCache] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Hydrate from localStorage on first client render
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) {
        setLoadedFromCache(false);
        return;
      }

      const parsed = JSON.parse(raw) as StudyEngineSnapshot | null;
      if (!parsed || !parsed.state) {
        setLoadedFromCache(false);
        return;
      }

      if (parsed.state.classId !== CLASS_ID) {
        setLoadedFromCache(false);
        return;
      }

      setCurrentDayIndex(parsed.state.currentDayIndex ?? 1);
      setCompletedDays(parsed.state.completedDays ?? 0);
      setBacklogDays(parsed.state.backlogDays ?? 0);
      setAheadDays(parsed.state.aheadDays ?? 0);
      setStreak(parsed.state.streak ?? 0);
      setLoadedFromCache(true);
      setLoadError(null);
    } catch (error) {
      console.error("Failed to load study engine snapshot from localStorage", error);
      setLoadError("Could not read local study data. Starting fresh this session.");
      setLoadedFromCache(false);
    }
  }, []);

  const remainingDays = Math.max(TOTAL_PLANNED_DAYS - completedDays, 0);
  const safeTotal = TOTAL_PLANNED_DAYS || 1;
  const progressPercent = Math.min(
    100,
    Math.max(0, (completedDays / safeTotal) * 100)
  );

  const todayArcInfo = getArcForDayIndex(currentDayIndex);
  const dailyMessage = getDailyMessage({
    currentDayIndex,
    backlogDays,
    aheadDays,
    completedDays,
    arcLabel: todayArcInfo?.arc.label ?? "Arc",
    arcTitle: todayArcInfo?.arc.title ?? "Current section",
  });

  const engineState: StudyEngineState = {
    classId: CLASS_ID,
    currentDayIndex,
    completedDays,
    backlogDays,
    aheadDays,
    streak,
    totalPlannedDays: TOTAL_PLANNED_DAYS,
  };

  const snapshot: StudyEngineSnapshot = {
    version: STUDY_ENGINE_VERSION,
    state: engineState,
    todayArc: todayArcInfo
      ? {
          arcId: todayArcInfo.arc.id,
          label: todayArcInfo.arc.label,
          title: todayArcInfo.arc.title,
          dayIndexWithinArc: todayArcInfo.dayIndexWithinArc,
          totalDaysInArc: todayArcInfo.totalDaysInArc,
        }
      : null,
  };

  // Persist to localStorage whenever the snapshot changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snapshot));
      const iso = new Date().toISOString();
      setLastSavedAt(iso);
    } catch (error) {
      console.error("Failed to save study engine snapshot to localStorage", error);
    }
  }, [snapshot.version, snapshot.state, snapshot.todayArc]);

  function handleCompleteToday() {
    if (completedDays < TOTAL_PLANNED_DAYS) {
      setCompletedDays((prev) => prev + 1);
      setCurrentDayIndex((prev) => clampDay(prev + 1));
      setStreak((prev) => prev + 1);
      if (backlogDays > 0) {
        setBacklogDays((prev) => Math.max(prev - 1, 0));
      }
    }
  }

  function handleSimulateMissedDay() {
    setBacklogDays((prev) => prev + 1);
    setStreak(0);
  }

  function handleCompleteBacklog() {
    if (backlogDays > 0) {
      setBacklogDays((prev) => Math.max(prev - 1, 0));
      setCompletedDays((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    }
  }

  function handleWorkAhead() {
    if (completedDays < TOTAL_PLANNED_DAYS) {
      setAheadDays((prev) => prev + 1);
      setCompletedDays((prev) => prev + 1);
      setCurrentDayIndex((prev) => clampDay(prev + 1));
      setStreak((prev) => prev + 1);
    }
  }

  function resetPreview() {
    setCurrentDayIndex(1);
    setCompletedDays(0);
    setBacklogDays(0);
    setAheadDays(0);
    setStreak(0);
    setLoadedFromCache(false);
    setLoadError(null);
    setLastSavedAt(null);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }

  return (
    <main className="min-h-screen gaia-surface">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:py-12">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] gaia-muted">
            Apollo - Academy - Learning Class
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold gaia-strong">
            {CLASS_NAME}
          </h1>
          <p className="gaia-muted text-sm sm:text-base max-w-3xl">
            {CLASS_GOAL}
          </p>
        </header>

        {/* Arcs overview */}
        <section className="gaia-panel rounded-2xl p-4 sm:p-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold gaia-strong">
                Arcs overview
              </h2>
              <p className="gaia-muted text-xs sm:text-sm max-w-2xl">
                High-level chapters of this learning class. Detailed lessons,
                daily Study Days, and persistent progress tracking plug into
                this structure.
              </p>
            </div>
            <div className="flex flex-col items-start gap-1 text-xs sm:text-sm">
              <span className="gaia-muted">
                Estimated journey:{" "}
                <span className="font-medium gaia-strong">
                  ~18-24 months
                </span>
              </span>
              <span className="gaia-muted">
                Planned lessons:{" "}
                <span className="font-medium gaia-strong">
                  ~185-225 (approx.)
                </span>
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {arcs.map((arc) => (
              <article
                key={arc.id}
                className="gaia-panel-soft rounded-xl p-4 flex flex-col gap-2"
              >
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] gaia-muted">
                    {arc.label}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold gaia-strong">
                    {arc.title}
                  </h3>
                </div>
                <p className="gaia-muted text-xs leading-relaxed">
                  {arc.focus}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[0.7rem]">
                  <span className="gaia-chip inline-flex items-center gap-1 rounded-full px-2 py-1">
                    <span className="font-medium">Duration</span>
                    <span className="gaia-muted">
                      - {arc.estimatedDuration}
                    </span>
                  </span>
                  <span className="gaia-chip inline-flex items-center gap-1 rounded-full px-2 py-1">
                    <span className="font-medium">Lessons</span>
                    <span className="gaia-muted">
                      - {arc.approxLessons}
                    </span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Study engine preview + narrative + arc context + storage preview + schema hint */}
        <section className="gaia-panel-soft rounded-2xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold gaia-strong">
                Study engine - Week 7 (local persistence)
              </h2>
              <p className="gaia-muted mt-1 text-xs sm:text-sm max-w-3xl">
                This engine now remembers your simulated progress on this
                device using local storage. Supabase sync will later reuse the
                same snapshot payload.
              </p>
            </div>
            <button
              type="button"
              onClick={resetPreview}
              className="mt-2 inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[0.7rem] font-medium gaia-strong border-white/10 hover:border-white/25 transition"
            >
              Reset local data
            </button>
          </div>

          {/* Progress row */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs sm:text-sm">
            <div className="gaia-panel rounded-xl p-3">
              <p className="gaia-muted text-[0.7rem] uppercase tracking-[0.18em]">
                Current study day
              </p>
              <p className="mt-1 text-xl font-semibold gaia-strong">
                Day {currentDayIndex}
              </p>
              <p className="gaia-muted mt-1 text-[0.7rem]">
                Out of ~{TOTAL_PLANNED_DAYS} planned days.
              </p>
            </div>
            <div className="gaia-panel rounded-xl p-3">
              <p className="gaia-muted text-[0.7rem] uppercase tracking-[0.18em]">
                Completed
              </p>
              <p className="mt-1 text-xl font-semibold gaia-strong">
                {completedDays}
              </p>
              <p className="gaia-muted mt-1 text-[0.7rem]">
                Remaining ~{remainingDays}.
              </p>
            </div>
            <div className="gaia-panel rounded-xl p-3">
              <p className="gaia-muted text-[0.7rem] uppercase tracking-[0.18em]">
                Backlog days
              </p>
              <p className="mt-1 text-xl font-semibold gaia-strong">
                {backlogDays}
              </p>
              <p className="gaia-muted mt-1 text-[0.7rem]">
                Days you owe because you missed sessions.
              </p>
            </div>
            <div className="gaia-panel rounded-xl p-3">
              <p className="gaia-muted text-[0.7rem] uppercase tracking-[0.18em]">
                Streak
              </p>
              <p className="mt-1 text-xl font-semibold gaia-strong">
                {streak} day{streak === 1 ? "" : "s"}
              </p>
              <p className="gaia-muted mt-1 text-[0.7rem]">
                Consecutive days where you completed at least one Study Day
                in this engine.
              </p>
            </div>
          </div>

          {/* Arc context for today */}
          <div className="gaia-panel rounded-xl p-4 space-y-2 text-xs sm:text-sm">
            <p className="gaia-muted text-[0.7rem] uppercase tracking-[0.18em]">
              Today&apos;s arc context
            </p>
            {todayArcInfo ? (
              <>
                <p className="gaia-strong">
                  {todayArcInfo.arc.label} - {todayArcInfo.arc.title}
                </p>
                <p className="gaia-muted">
                  You are on day {todayArcInfo.dayIndexWithinArc} of{" "}
                  {todayArcInfo.totalDaysInArc} in this Arc.
                </p>
                <p className="gaia-muted">
                  Focus of this Arc: {todayArcInfo.arc.focus}
                </p>
              </>
            ) : (
              <p className="gaia-muted">
                This Study Day is outside the configured Arc ranges. Once the
                final schedule is locked, every day will belong to an Arc.
              </p>
            )}
          </div>

          {/* Progress bar */}
          <div className="gaia-panel rounded-xl p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="gaia-muted text-[0.7rem] uppercase tracking-[0.18em]">
                Overall progress
              </p>
              <p className="gaia-muted text-[0.7rem]">
                {progressPercent.toFixed(1)}% of this class (preview)
              </p>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/70 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="gaia-muted text-[0.7rem]">
              This bar shows how much of the ~200 planned Study Days you have
              currently marked as complete.
            </p>
          </div>

          {/* Narrative message */}
          <div className="gaia-panel rounded-xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
            <p className="gaia-muted text-[0.7rem] uppercase tracking-[0.18em]">
              Today&apos;s recommendation
            </p>
            <p className="leading-relaxed gaia-strong/80">
              {dailyMessage}
            </p>
          </div>

          {/* Local cache status */}
          <div className="gaia-panel rounded-xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
            <p className="gaia-muted text-[0.7rem] uppercase tracking-[0.18em]">
              Local cache status
            </p>
            <div className="space-y-1 gaia-muted max-w-3xl">
              {loadedFromCache ? (
                <p>Loaded an existing Study Engine snapshot from this device.</p>
              ) : (
                <p>
                  No previous Study Engine snapshot was found on this device.
                  You are starting fresh for this class here.
                </p>
              )}
              {lastSavedAt && (
                <p>
                  Last saved:{" "}
                  <span className="gaia-strong/80">{lastSavedAt}</span>{" "}
                  (local device time)
                </p>
              )}
              {loadError && (
                <p className="text-xs text-red-300">
                  {loadError}
                </p>
              )}
              <p className="text-xs">
                Local storage is per browser and per device. When we add
                Supabase sync, your Study Engine state will also be available
                across devices.
              </p>
            </div>
          </div>

          {/* Storage preview */}
          <div className="gaia-panel rounded-xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
            <p className="gaia-muted text-[0.7rem] uppercase tracking-[0.18em]">
              Snapshot payload (for local + future Supabase)
            </p>
            <p className="gaia-muted max-w-3xl">
              This JSON snapshot is what gets stored locally now, and it is
              also the exact structure we will send to Supabase later for
              cross-device sync.
            </p>
            <div className="max-h-64 overflow-auto rounded-xl bg-black/40 p-3 text-[0.65rem] leading-relaxed font-mono">
              <pre>{JSON.stringify(snapshot, null, 2)}</pre>
            </div>
          </div>

          {/* Supabase schema hint */}
          <div className="gaia-panel rounded-xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
            <p className="gaia-muted text-[0.7rem] uppercase tracking-[0.18em]">
              Supabase schema hint
            </p>
            <p className="gaia-muted max-w-3xl">
              Use this as a guide when creating your Supabase table for the
              Study Engine. You don&apos;t need to wire it up yet; just make
              sure the structure matches, so that when we add the real
              read/write logic, it will align cleanly.
            </p>
            <div className="max-h-64 overflow-auto rounded-xl bg-black/40 p-3 text-[0.65rem] leading-relaxed font-mono">
              <pre>{SUPABASE_SCHEMA_HINT}</pre>
            </div>
          </div>

          {/* Controls */}
          <div className="gaia-panel rounded-xl p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm">
            <div className="max-w-xl gaia-muted">
              <p>
                Use these buttons to update your Study Engine state. Changes
                are now persisted to this device automatically.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCompleteToday}
                className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[0.7rem] font-medium gaia-strong bg-white/10 hover:bg-white/15 transition"
              >
                Complete today&apos;s Study Day
              </button>
              <button
                type="button"
                onClick={handleSimulateMissedDay}
                className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[0.7rem] font-medium gaia-strong border border-white/10 hover:border-white/25 transition"
              >
                Simulate missed day (+backlog)
              </button>
              <button
                type="button"
                onClick={handleCompleteBacklog}
                className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[0.7rem] font-medium gaia-strong border border-white/10 hover:border-white/25 transition"
              >
                Complete one backlog day
              </button>
              <button
                type="button"
                onClick={handleWorkAhead}
                className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[0.7rem] font-medium gaia-strong border border-white/10 hover:border-white/25 transition"
              >
                Work one day ahead
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
