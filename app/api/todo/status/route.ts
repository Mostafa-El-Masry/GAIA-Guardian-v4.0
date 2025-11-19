// app/api/todo/status/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const USER_ID = process.env.TODO_USER_ID || "00000000-0000-0000-0000-000000000001";

export async function POST(req: Request) {
  const supabase = supabaseAdmin();
  const body = await req.json();
  const { task_id, date, status } = body || {};
  if (!task_id || !date || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  // Verify task belongs to the user
  const { data: task, error: terr } = await supabase.from("tasks").select("id,user_id").eq("id", task_id).single();
  if (terr) return NextResponse.json({ error: terr.message }, { status: 500 });
  if (!task || task.user_id !== USER_ID) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const upsert = { task_id, date, status };
  const { error } = await supabase.from("task_day_status").upsert(upsert);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const supabase = supabaseAdmin();
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("task_id");
  const date = searchParams.get("date");
  if (!taskId || !date) {
    return NextResponse.json({ error: "Missing task_id or date" }, { status: 400 });
  }
  const { data: task, error: terr } = await supabase
    .from("tasks")
    .select("id,user_id")
    .eq("id", taskId)
    .single();
  if (terr) return NextResponse.json({ error: terr.message }, { status: 500 });
  if (!task || task.user_id !== USER_ID) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { error } = await supabase
    .from("task_day_status")
    .delete()
    .eq("task_id", taskId)
    .eq("date", date);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
