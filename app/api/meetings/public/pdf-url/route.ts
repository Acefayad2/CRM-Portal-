/**
 * GET /api/meetings/public/pdf-url?token=xxx
 * Returns a renderable presentation source for the meeting deck (for guest viewer). Valid for 1 hour.
 */
import { NextResponse } from "next/server"
import { validateInviteToken } from "@/lib/meetings"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { buildPresentationSource, parsePresentationSourceMetadata } from "@/lib/presentation-source"

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
    if (!result.ok || !result.meeting?.deck_id) {
      return NextResponse.json(
        { error: result.ok ? "No deck" : (result.error ?? "Invalid link") },
        { status: 403 }
      )
    }

    const { data: slide } = await supabase
      .from("slides")
      .select("storage_path, speaker_notes")
      .eq("deck_id", result.meeting.deck_id)
      .limit(1)
      .maybeSingle()

    if (!slide?.storage_path) {
      return NextResponse.json({ error: "No slides" }, { status: 404 })
    }

    const metadata = parsePresentationSourceMetadata(slide.speaker_notes)
    let signedUrl: string | null = null
    if (metadata?.kind !== "link") {
      const signedResult = await supabase.storage
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
    console.error("[api/meetings/public/pdf-url] Error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
