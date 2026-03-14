/**
 * GET /api/meetings/[id] - get meeting (host only)
 * PATCH /api/meetings/[id] - update meeting (host): title, status, deck_id
 */
import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/supabase"
import { resolvePresentationActor } from "@/lib/presentation-actor"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const actor = await resolvePresentationActor()
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await actor.client
      .from("meetings")
      .select("id, host_user_id, title, status, starts_at, ends_at, created_at, deck_id")
      .eq("id", id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }
    if (data.host_user_id !== actor.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error("[api/meetings/[id]] GET error:", err)
    return NextResponse.json({ error: "Failed to load meeting" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const actor = await resolvePresentationActor()
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: existing, error: fetchError } = await actor.client
      .from("meetings")
      .select("id, host_user_id")
      .eq("id", id)
      .single()

    if (fetchError || !existing || existing.host_user_id !== actor.userId) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    let body: { title?: string; status?: string; deck_id?: string | null }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}
    if (typeof body.title === "string") updates.title = body.title.trim() || "Untitled Meeting"
    if (body.status === "live" || body.status === "ended" || body.status === "draft") {
      updates.status = body.status
      if (body.status === "live") updates.starts_at = new Date().toISOString()
      if (body.status === "ended") updates.ends_at = new Date().toISOString()
    }
    if (body.deck_id !== undefined) updates.deck_id = body.deck_id === null || body.deck_id === "" ? null : body.deck_id

    if (Object.keys(updates).length === 0) {
      const { data } = await actor.client.from("meetings").select("*").eq("id", id).single()
      return NextResponse.json(data)
    }

    const { data, error } = await actor.client
      .from("meetings")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[api/meetings/[id]] PATCH error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error("[api/meetings/[id]] PATCH error:", err)
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 })
  }
}
