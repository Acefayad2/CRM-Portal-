import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const supabaseAuth = await createClient()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { lesson_id, last_watched_seconds, completed, score, attempts } = body as {
    lesson_id: string
    last_watched_seconds?: number
    completed?: boolean
    score?: number
    attempts?: number
  }
  if (!lesson_id) {
    return NextResponse.json({ error: "lesson_id required" }, { status: 400 })
  }

  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }

  // Ensure lesson exists and belongs to a published course (no arbitrary progress rows)
  const { data: lesson } = await supabase.from("lessons").select("id, module_id").eq("id", lesson_id).single()
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
  }
  const { data: mod } = await supabase.from("modules").select("course_id").eq("id", lesson.module_id).single()
  if (!mod) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 })
  }
  const { data: course } = await supabase.from("courses").select("id").eq("id", mod.course_id).eq("is_published", true).single()
  if (!course) {
    return NextResponse.json({ error: "Course or lesson not available" }, { status: 404 })
  }

  const updates: Record<string, unknown> = {
    user_id: user.id,
    lesson_id,
    updated_at: new Date().toISOString(),
  }
  if (typeof last_watched_seconds === "number") updates.last_watched_seconds = last_watched_seconds
  if (typeof completed === "boolean") updates.completed = completed
  if (typeof score === "number") updates.score = score
  if (typeof attempts === "number") updates.attempts = attempts

  const { error } = await supabase.from("user_lesson_progress").upsert(updates, {
    onConflict: "user_id,lesson_id",
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
