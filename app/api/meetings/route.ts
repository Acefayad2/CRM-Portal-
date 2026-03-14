/**
 * GET /api/meetings - list meetings for current user (host)
 * POST /api/meetings - create meeting
 */
import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/supabase"
import { resolvePresentationActor } from "@/lib/presentation-actor"

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const actor = await resolvePresentationActor()
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await actor.client
      .from("meetings")
      .select("id, title, status, starts_at, ends_at, created_at, deck_id")
      .eq("host_user_id", actor.userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[api/meetings] GET error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ meetings: data ?? [] })
  } catch (err) {
    console.error("[api/meetings] Error:", err)
    return NextResponse.json({ error: "Failed to list meetings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const actor = await resolvePresentationActor()
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let body: { title?: string }
    try {
      body = await request.json()
    } catch {
      body = {}
    }
    const title = typeof body.title === "string" ? body.title.trim() || "Untitled Meeting" : "Untitled Meeting"

    const { data: meeting, error } = await actor.client
      .from("meetings")
      .insert({
        host_user_id: actor.userId,
        title,
        status: "draft",
      })
      .select("id, title, status, starts_at, ends_at, created_at, deck_id")
      .single()

    if (error) {
      console.error("[api/meetings] POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    try {
      const { supabase: supabaseAdmin } = await import("@/lib/supabase")
      if (supabaseAdmin) {
        await supabaseAdmin.from("meeting_state").insert({
          meeting_id: meeting.id,
          current_slide_index: 0,
        })
      }
    } catch (stateErr) {
      console.warn("[api/meetings] meeting_state insert failed (non-fatal):", stateErr)
    }

    return NextResponse.json({ meeting })
  } catch (err) {
    console.error("[api/meetings] Error:", err)
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 })
  }
}
