/**
 * GET /api/meetings/public/state?token=xxx - for guest viewers: meeting + state + deck + slides
 * PATCH /api/meetings/public/state?token=xxx - update current_slide_index when allow_client_navigation
 */
import { NextResponse } from "next/server"
import { validateInviteToken } from "@/lib/meetings"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const url = new URL(request.url)
    const token = url.searchParams.get("token")?.trim()
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 })
    }

    const result = await validateInviteToken(token)
    if (!result.ok || !result.meeting) {
      return NextResponse.json(
        { error: result.error ?? "Invalid or expired link" },
        { status: 403 }
      )
    }

    const state = result.state ?? {
      meeting_id: result.meeting.id,
      current_slide_index: 0,
      allow_client_navigation: false,
      updated_at: new Date().toISOString(),
    }

    let deck = null
    let slides: { id: string; slide_index: number; storage_path: string; speaker_notes: string | null }[] = []
    if (result.meeting.deck_id) {
      const { data: deckRow } = await supabase
        .from("slide_decks")
        .select("id, title")
        .eq("id", result.meeting.deck_id)
        .single()
      if (deckRow) {
        deck = deckRow
        const { data: slideRows } = await supabase
          .from("slides")
          .select("id, slide_index, storage_path, speaker_notes")
          .eq("deck_id", result.meeting.deck_id)
          .order("slide_index", { ascending: true })
        slides = (slideRows ?? []).map((s) => ({
          id: s.id,
          slide_index: s.slide_index,
          storage_path: s.storage_path,
          speaker_notes: s.speaker_notes ?? null,
        }))
      }
    }

    return NextResponse.json({
      meeting: {
        id: result.meeting.id,
        title: result.meeting.title,
        status: result.meeting.status,
      },
      state: {
        current_slide_index: state.current_slide_index,
        allow_client_navigation: state.allow_client_navigation,
      },
      deck,
      slides,
    })
  } catch (err) {
    console.error("[api/meetings/public/state] GET error:", err)
    return NextResponse.json({ error: "Failed to load meeting" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const url = new URL(request.url)
    const token = url.searchParams.get("token")?.trim()
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 })
    }

    const result = await validateInviteToken(token)
    if (!result.ok || !result.meeting) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 })
    }

    const { data: stateRow } = await supabase
      .from("meeting_state")
      .select("allow_client_navigation, current_slide_index")
      .eq("meeting_id", result.meeting.id)
      .single()

    if (!stateRow?.allow_client_navigation) {
      return NextResponse.json({ error: "Client navigation not allowed" }, { status: 403 })
    }

    let body: { current_slide_index?: number }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    const index = typeof body.current_slide_index === "number" ? Math.max(0, body.current_slide_index) : undefined
    if (index === undefined) {
      return NextResponse.json({ error: "current_slide_index required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("meeting_state")
      .update({ current_slide_index: index, updated_at: new Date().toISOString() })
      .eq("meeting_id", result.meeting.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    console.error("[api/meetings/public/state] PATCH error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
