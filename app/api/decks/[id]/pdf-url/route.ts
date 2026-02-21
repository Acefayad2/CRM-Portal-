/**
 * GET /api/decks/[id]/pdf-url - signed URL for deck PDF (host only, 1 hour)
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: deck } = await supabase
      .from("slide_decks")
      .select("id, owner_user_id")
      .eq("id", deckId)
      .single()

    if (!deck || deck.owner_user_id !== user.id) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    const { data: slide } = await supabase
      .from("slides")
      .select("storage_path")
      .eq("deck_id", deckId)
      .limit(1)
      .maybeSingle()

    if (!slide?.storage_path) {
      return NextResponse.json({ error: "No slides" }, { status: 404 })
    }

    const { data: signed, error } = await supabase.storage
      .from("slide-decks")
      .createSignedUrl(slide.storage_path, 3600)

    if (error || !signed?.signedUrl) {
      return NextResponse.json({ error: "Failed to create link" }, { status: 500 })
    }
    return NextResponse.json({ url: signed.signedUrl })
  } catch (err) {
    console.error("[api/decks/[id]/pdf-url] Error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
