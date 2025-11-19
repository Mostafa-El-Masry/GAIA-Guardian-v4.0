// app/api/todo/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Single-user baseline: we derive a user_id from env or default constant.
// Later, replace with Supabase Auth user id.
const USER_ID = process.env.TODO_USER_ID || "00000000-0000-0000-0000-000000000001";
const normalizeTitle = (title?: string) => (title ?? "").trim().toLowerCase();

export async function GET() {
  const supabase = supabaseAdmin();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", USER_ID)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Deduplicate by category + title (case-insensitive) to avoid repeated rows.
  const seen = new Set<string>();
  const dedupedTasks = [];
  for (const t of tasks || []) {
    const key = `${t.category}|${normalizeTitle(t.title)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedupedTasks.push(t);
  }
  // Also pull statuses
  const { data: statuses, error: err2 } = await supabase
    .from("task_day_status")
    .select("*")
    .in("task_id", dedupedTasks.map(t => t.id));
  if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
  return NextResponse.json({ tasks: dedupedTasks, statuses: statuses || [] });
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
  const normalizedTitle = normalizeTitle(payload.title);
  // Prevent duplicates: if a task already exists for this category with the same title,
  // return it instead of inserting another row.
  const { data: existing, error: dupErr } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("category", payload.category);
  if (dupErr) return NextResponse.json({ error: dupErr.message }, { status: 500 });
  const duplicate = (existing || []).find(
    (t) => normalizeTitle(t.title) === normalizedTitle
  );
  if (duplicate) {
    return NextResponse.json({ task: duplicate, duplicate: true });
  }
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
  // Guard against renaming to an existing task title in the same category.
  if (patch?.title) {
    const { data: tasks, error: fetchErr } = await supabase
      .from("tasks")
      .select("id,title,category")
      .eq("user_id", USER_ID);
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    const current = (tasks || []).find((t) => t.id === id);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const targetCategory = patch.category ?? current.category;
    const normalizedTitle = normalizeTitle(patch.title);
    const duplicate = (tasks || []).find(
      (t) =>
        t.id !== id &&
        t.category === targetCategory &&
        normalizeTitle(t.title) === normalizedTitle
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "Duplicate task title in this category", task: duplicate },
        { status: 409 }
      );
    }
  }
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
