/**
 * GET /api/meetings/[id]/state - get meeting state (host via auth; no guest here, use /api/meetings/public/state?token=)
 * PATCH /api/meetings/[id]/state - update state (host only): current_slide_index, allow_client_navigation, presenter camera
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: meeting } = await supabase
      .from("meetings")
      .select("id, host_user_id")
      .eq("id", meetingId)
      .single()

    if (!meeting || meeting.host_user_id !== user.id) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    const { data: state, error } = await supabase
      .from("meeting_state")
      .select("meeting_id, current_slide_index, allow_client_navigation, host_camera_frame, host_camera_updated_at, show_host_camera, updated_at")
      .eq("meeting_id", meetingId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!state) {
      return NextResponse.json({
        current_slide_index: 0,
        allow_client_navigation: false,
        host_camera_frame: null,
        host_camera_updated_at: null,
        show_host_camera: true,
        updated_at: new Date().toISOString(),
      })
    }
    return NextResponse.json(state)
  } catch (err) {
    console.error("[api/meetings/[id]/state] GET error:", err)
    return NextResponse.json({ error: "Failed to get state" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: meeting } = await supabase
      .from("meetings")
      .select("id, host_user_id")
      .eq("id", meetingId)
      .single()

    if (!meeting || meeting.host_user_id !== user.id) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    let body: {
      current_slide_index?: number
      allow_client_navigation?: boolean
      host_camera_frame?: string | null
      show_host_camera?: boolean
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (typeof body.current_slide_index === "number" && body.current_slide_index >= 0) {
      updates.current_slide_index = body.current_slide_index
    }
    if (typeof body.allow_client_navigation === "boolean") {
      updates.allow_client_navigation = body.allow_client_navigation
    }
    if (typeof body.show_host_camera === "boolean") {
      updates.show_host_camera = body.show_host_camera
    }
    if (body.host_camera_frame === null) {
      updates.host_camera_frame = null
      updates.host_camera_updated_at = null
    } else if (typeof body.host_camera_frame === "string" && body.host_camera_frame.startsWith("data:image/")) {
      updates.host_camera_frame = body.host_camera_frame
      updates.host_camera_updated_at = new Date().toISOString()
    }

    if (Object.keys(updates).length <= 1) {
      const { data } = await supabase.from("meeting_state").select("*").eq("meeting_id", meetingId).maybeSingle()
      return NextResponse.json(data ?? { meeting_id: meetingId, current_slide_index: 0, allow_client_navigation: false, show_host_camera: true })
    }

    const { data, error } = await supabase
      .from("meeting_state")
      .upsert({ meeting_id: meetingId, ...updates }, { onConflict: "meeting_id" })
      .select()
      .single()

    if (error) {
      console.error("[api/meetings/[id]/state] PATCH error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error("[api/meetings/[id]/state] PATCH error:", err)
    return NextResponse.json({ error: "Failed to update state" }, { status: 500 })
  }
}
