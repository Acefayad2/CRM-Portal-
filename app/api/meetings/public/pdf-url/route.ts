/**
 * GET /api/meetings/public/pdf-url?token=xxx
 * Returns a signed URL for the meeting's deck PDF (for guest viewer). Valid for 1 hour.
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
    if (!result.ok || !result.meeting?.deck_id) {
      return NextResponse.json(
        { error: result.ok ? "No deck" : (result.error ?? "Invalid link") },
        { status: 403 }
      )
    }

    const { data: slide } = await supabase
      .from("slides")
      .select("storage_path")
      .eq("deck_id", result.meeting.deck_id)
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
    console.error("[api/meetings/public/pdf-url] Error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
