// app/Dashboard/components/TodoSlot.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Heart,
  Briefcase,
  Gamepad2,
  Trash2,
  Check,
  SkipForward,
  Calendar,
} from "lucide-react";
import type { Category, SlotState, Task } from "../hooks/useTodoDaily";
import TodoQuickAdd from "./TodoQuickAdd";

type Props = {
  category: Category;
  task: Task | null;
  state: SlotState;
  completedTitle?: string;
  today: string;
  onDone: (c: Category) => void;
  onSkip: (c: Category) => void;
  onQuickAdd: (
    c: Category,
    title: string,
    note?: string,
    priority?: 1 | 2 | 3,
    pinned?: boolean
  ) => void;
  onDelete: (taskId: string) => void;
  onEdit: (
    taskId: string,
    patch: Partial<
      Pick<
        Task,
        "title" | "note" | "priority" | "pinned" | "due_date" | "repeat"
      >
    >
  ) => void;
};

export default function TodoSlot(props: Props) {
  const {
    category,
    task,
    state,
    completedTitle,
    today,
    onDone,
    onSkip,
    onQuickAdd,
    onDelete,
    onEdit,
  } = props;
  const [showAdd, setShowAdd] = useState(false);
  const catStyle = useMemo(() => styleForCategory(category), [category]);
  const dueLabel = task?.due_date ?? "Unscheduled";
  const relativeLabel = describeRelativeDay(task?.due_date, today);
  const actionBtn =
    "flex-1 rounded-lg border border-[var(--gaia-border)] bg-[var(--gaia-contrast-bg)] px-3 py-2 font-semibold text-[var(--gaia-contrast-text)] transition-opacity hover:opacity-90";

  return (
    <div
      className={`rounded-xl border border-[var(--gaia-border)] bg-[var(--gaia-surface)] p-5 shadow-sm transition-all hover:shadow-md hover:border-[var(--gaia-border)] min-h-[18rem] overflow-hidden `}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {categoryIcon(category)}
          <span className={`font-bold text-lg text-[var(--gaia-text-strong)]`}>
            {labelOf(category)}
          </span>
          <span className="rounded-md bg-[var(--gaia-border)] px-2 py-1 text-xs font-medium text-[var(--gaia-text-muted)]">
            {relativeLabel}
          </span>
          <span className="text-xs font-medium text-[var(--gaia-text-muted)]">
            {dueLabel}
          </span>
        </div>
      </div>

      {state === "pending" && task ? (
        <div className="flex flex-col h-full">
          <div className="mb-4 h-48">
            <div className="mb-3 line-clamp-2 text-lg font-bold text-[var(--gaia-text-strong)]">
              {task.title}
            </div>

            {task.due_date && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-[var(--gaia-border)] px-2 py-1 text-sm text-[var(--gaia-text-default)]">
                  <Calendar size={16} /> {task.due_date}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                className={actionBtn}
                onClick={() => onDelete(task.id)}
                title="Delete task"
              >
                <Trash2 size={18} />
              </button>
              <button
                className={actionBtn}
                onClick={() => onSkip(category)}
                title="Skip this task"
              >
                <SkipForward size={18} className="mx-auto" />
              </button>
              <button
                className={actionBtn}
                onClick={() => onDone(category)}
                title="Mark as done"
              >
                <Check size={18} className="mx-auto" />
              </button>
            </div>
          </div>
        </div>
      ) : state === "done" ? (
        <div className="flex min-h-12 mt-12 flex-col items-center justify-center rounded-xl border border-[var(--gaia-positive-border)] bg-[var(--gaia-positive-bg)]/40 px-4 py-6 text-center text-[var(--gaia-positive)]">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--gaia-positive-bg)] px-3 py-1 text-sm font-semibold">
            <Check size={18} />
            Done
          </div>
          <p className="text-lg font-semibold text-[var(--gaia-text-strong)]">
            {completedTitle ?? "All done!"}
          </p>
          <p className="mt-2 text-sm text-[var(--gaia-text-muted)]">
            We'll surface tomorrow's tasks automatically.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-3 py-2 text-center text-sm text-[var(--gaia-text-muted)]">
            {labelOf(category)} — No task today
          </div>
          {!showAdd ? (
            <button
              className="w-full rounded-lg bg-[var(--gaia-contrast-bg)] px-4 py-2 font-semibold text-[var(--gaia-contrast-text)] transition-opacity hover:opacity-90"
              onClick={() => setShowAdd(true)}
            >
              + Quick Add
            </button>
          ) : (
            <TodoQuickAdd
              category={category}
              onAdd={onQuickAdd}
              onClose={() => setShowAdd(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function labelOf(c: Category) {
  if (c === "life") return "Life";
  if (c === "work") return "Work";
  return "Distraction";
}

function describeRelativeDay(dateStr: string | null | undefined, todayStr: string) {
  const target = dateStr ?? todayStr;
  const parse = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return Date.UTC(y, (m ?? 1) - 1, d ?? 1);
  };
  const todayMs = parse(todayStr);
  const targetMs = parse(target);
  const diff = Math.round((targetMs - todayMs) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff >= 2 && diff <= 6) return `In ${diff} days`;
  if (diff >= 7 && diff <= 13) return "Next week";
  if (diff <= -2 && diff >= -6) return `${Math.abs(diff)} days ago`;
  if (diff <= -7 && diff >= -13) return "Last week";
  return target;
}

function categoryIcon(c: Category) {
  if (c === "life") return <Heart size={20} className="text-teal-500" />;
  if (c === "work") return <Briefcase size={20} className="text-indigo-500" />;
  return <Gamepad2 size={20} className="text-amber-500" />;
}

function styleForCategory(c: Category) {
  return { bg: "", text: "" };
}
