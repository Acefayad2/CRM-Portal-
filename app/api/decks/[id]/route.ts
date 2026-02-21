/**
 * GET /api/decks/[id] - get deck and slides (host only)
 * PATCH /api/decks/[id] - update deck title
 * DELETE /api/decks/[id] - delete deck
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: deck, error: deckError } = await supabase
      .from("slide_decks")
      .select("id, title, created_at, owner_user_id")
      .eq("id", id)
      .single()

    if (deckError || !deck || deck.owner_user_id !== user.id) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    const { data: slides } = await supabase
      .from("slides")
      .select("id, slide_index, storage_path, speaker_notes")
      .eq("deck_id", id)
      .order("slide_index", { ascending: true })

    return NextResponse.json({ deck, slides: slides ?? [] })
  } catch (err) {
    console.error("[api/decks/[id]] GET error:", err)
    return NextResponse.json({ error: "Failed to load deck" }, { status: 500 })
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: deck } = await supabase
      .from("slide_decks")
      .select("id, owner_user_id")
      .eq("id", id)
      .single()

    if (!deck || deck.owner_user_id !== user.id) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    let body: { title?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    if (typeof body.title !== "string") {
      return NextResponse.json({ error: "title required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("slide_decks")
      .update({ title: body.title.trim() || "Untitled Deck" })
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    console.error("[api/decks/[id]] PATCH error:", err)
    return NextResponse.json({ error: "Failed to update deck" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: deck } = await supabase
      .from("slide_decks")
      .select("id, owner_user_id")
      .eq("id", id)
      .single()

    if (!deck || deck.owner_user_id !== user.id) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    const { error } = await supabase.from("slide_decks").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/decks/[id]] DELETE error:", err)
    return NextResponse.json({ error: "Failed to delete deck" }, { status: 500 })
  }
}
