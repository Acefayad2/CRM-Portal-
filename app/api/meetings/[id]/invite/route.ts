/**
 * POST /api/meetings/[id]/invite - create expiring invite token (host only)
 * Body: { expiresInHours?: number } default 24
 */
import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/supabase"
import { generateInviteToken } from "@/lib/meetings"
import { resolvePresentationActor } from "@/lib/presentation-actor"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const actor = await resolvePresentationActor()
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: meeting } = await actor.client
      .from("meetings")
      .select("id, host_user_id")
      .eq("id", meetingId)
      .single()

    if (!meeting || meeting.host_user_id !== actor.userId) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    let body: { expiresInHours?: number }
    try {
      body = await request.json().catch(() => ({}))
    } catch {
      body = {}
    }
    const hours = typeof body.expiresInHours === "number" && body.expiresInHours > 0
      ? Math.min(168, body.expiresInHours)
      : 24
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000)
    const invite_token = generateInviteToken()

    const { data: invite, error } = await actor.client
      .from("meeting_invites")
      .insert({ meeting_id: meetingId, invite_token, expires_at: expiresAt.toISOString() })
      .select("id, invite_token, expires_at, created_at")
      .single()

    if (error) {
      console.error("[api/meetings/[id]/invite] POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
    const joinUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/meet/${encodeURIComponent(invite.invite_token)}` : `/meet/${invite.invite_token}`

    return NextResponse.json({
      invite: { id: invite.id, invite_token: invite.invite_token, expires_at: invite.expires_at },
      joinUrl,
    })
  } catch (err) {
    console.error("[api/meetings/[id]/invite] Error:", err)
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 })
  }
}
