/**
 * GET /api/decks/[id]/pdf-url - returns a renderable presentation source (host only, 1 hour)
 */
import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/supabase"
import { resolvePresentationActor } from "@/lib/presentation-actor"
import { buildPresentationSource, parsePresentationSourceMetadata } from "@/lib/presentation-source"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const actor = await resolvePresentationActor()
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: deck } = await actor.client
      .from("slide_decks")
      .select("id, owner_user_id")
      .eq("id", deckId)
      .single()

    if (!deck || deck.owner_user_id !== actor.userId) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 })
    }

    const { data: slide } = await actor.client
      .from("slides")
      .select("storage_path, speaker_notes")
      .eq("deck_id", deckId)
      .limit(1)
      .maybeSingle()

    if (!slide?.storage_path) {
      return NextResponse.json({ error: "No slides" }, { status: 404 })
    }

    const metadata = parsePresentationSourceMetadata(slide.speaker_notes)
    let signedUrl: string | null = null
    if (metadata?.kind !== "link") {
      const signedResult = await actor.client.storage
        .from("slide-decks")
        .createSignedUrl(slide.storage_path, 3600)
      if (signedResult.error || !signedResult.data?.signedUrl) {
        return NextResponse.json({ error: "Failed to create link" }, { status: 500 })
      }
      signedUrl = signedResult.data.signedUrl
    }

    const source = buildPresentationSource({
      signedUrl,
      storagePathOrUrl: slide.storage_path,
      speakerNotes: slide.speaker_notes,
    })

    return NextResponse.json({
      url: source?.kind === "pdf" ? source.url : null,
      source,
    })
  } catch (err) {
    console.error("[api/decks/[id]/pdf-url] Error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
