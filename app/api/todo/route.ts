// app/api/todo/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { SupabaseClient } from "@supabase/supabase-js";

// Single-user baseline: we derive a user_id from env or default constant.
// Later, replace with Supabase Auth user id.
const USER_ID = process.env.TODO_USER_ID || "00000000-0000-0000-0000-000000000001";
const normalizeTitle = (title?: string) => (title ?? "").trim().toLowerCase();
const GAME_SERIES_START = new Date("2025-11-15T00:00:00Z");
const GAME_SERIES_END = new Date("2025-11-30T00:00:00Z");
const GAME_HOUR_TITLE = "Game for an hour";

type AdminClient = SupabaseClient<any, "public", any>;
type TaskRow = {
  id: string;
  category: string;
  title: string;
  due_date: string | null;
  [key: string]: unknown;
};

function enumerateDates(start: Date, end: Date): string[] {
  const dates: string[] = [];
  for (let cursor = new Date(start.getTime()); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    dates.push(cursor.toISOString().slice(0, 10));
  }
  return dates;
}

const GAME_SERIES_DATES = enumerateDates(GAME_SERIES_START, GAME_SERIES_END);

async function ensureGameSeriesTasks(
  supabase: AdminClient,
  existing: TaskRow[]
): Promise<TaskRow[]> {
  const tasks = existing.slice();
  const missingDates: string[] = [];
  for (const date of GAME_SERIES_DATES) {
    const exists = tasks.some(
      (t) =>
        t.category === "distraction" &&
        normalizeTitle(t.title) === normalizeTitle(GAME_HOUR_TITLE) &&
        t.due_date === date
    );
    if (!exists) missingDates.push(date);
  }
  if (missingDates.length === 0) return tasks;
  const payloads = missingDates.map((date) => ({
    user_id: USER_ID,
    category: "distraction",
    title: GAME_HOUR_TITLE,
    note: "Intentional break",
    priority: 1,
    pinned: false,
    due_date: date,
    repeat: "none",
  }));
  const { data, error } = await supabase.from("tasks").insert(payloads).select("*");
  if (error) {
    console.error("Failed to seed distraction tasks:", error);
    return tasks;
  }
  return tasks.concat(data || []);
}

export async function GET() {
  const supabase = supabaseAdmin();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", USER_ID)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const seededTasks = await ensureGameSeriesTasks(supabase, tasks || []);
  let statuses: any[] = [];
  if (seededTasks.length > 0) {
    const { data: statusRows, error: err2 } = await supabase
      .from("task_day_status")
      .select("*")
      .in(
        "task_id",
        seededTasks.map((t) => t.id)
      );
    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
    statuses = statusRows || [];
  }
  return NextResponse.json({ tasks: seededTasks, statuses });
}

export async function POST(req: Request) {
  const supabase = supabaseAdmin();
  const body = await req.json();
  const payload = {
    user_id: USER_ID,
    category: body.category,
    title: body.title,
    note: body.note ?? null,
    priority: body.priority ?? 2,
    pinned: !!body.pinned,
    due_date: body.due_date ?? null,
    repeat: body.repeat ?? "none",
  };
  const { data, error } = await supabase.from("tasks").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}

export async function PATCH(req: Request) {
  const supabase = supabaseAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const patch = await req.json();
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", USER_ID)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}

export async function DELETE(req: Request) {
  const supabase = supabaseAdmin();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", USER_ID);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
