/**
 * GET /api/decks - list slide decks for current user
 * POST /api/decks - create deck
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
      .from("slide_decks")
      .select("id, title, created_at")
      .eq("owner_user_id", actor.userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[api/decks] GET error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ decks: data ?? [] })
  } catch (err) {
    console.error("[api/decks] Error:", err)
    return NextResponse.json({ error: "Failed to list decks" }, { status: 500 })
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
      body = await request.json().catch(() => ({}))
    } catch {
      body = {}
    }
    const title = typeof body.title === "string" ? body.title.trim() || "Untitled Deck" : "Untitled Deck"

    const { data: deck, error } = await actor.client
      .from("slide_decks")
      .insert({ owner_user_id: actor.userId, title })
      .select("id, title, created_at")
      .single()

    if (error) {
      console.error("[api/decks] POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ deck })
  } catch (err) {
    console.error("[api/decks] Error:", err)
    return NextResponse.json({ error: "Failed to create deck" }, { status: 500 })
  }
}
