/**
 * Server-side meeting helpers. Use from API routes or server components.
 * For guest access use supabase (service role) to validate token and read meeting_state.
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export type Meeting = {
  id: string
  host_user_id: string
  title: string
  status: "draft" | "live" | "ended"
  starts_at: string | null
  ends_at: string | null
  created_at: string
  deck_id: string | null
}

export type MeetingState = {
  meeting_id: string
  current_slide_index: number
  allow_client_navigation: boolean
  host_camera_frame?: string | null
  host_camera_updated_at?: string | null
  show_host_camera?: boolean
  updated_at: string
}

export type MeetingInvite = {
  id: string
  meeting_id: string
  invite_token: string
  expires_at: string
  created_at: string
}

function isLegacyMeetingStateSchemaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const maybeError = error as { code?: string; message?: string }
  const message = maybeError.message ?? ""
  return maybeError.code === "42703" || /host_camera_frame|host_camera_updated_at|show_host_camera/.test(message)
}

async function loadMeetingState(meetingId: string): Promise<MeetingState | null> {
  if (!supabase) return null

  const fullSelect =
    "meeting_id, current_slide_index, allow_client_navigation, host_camera_frame, host_camera_updated_at, show_host_camera, updated_at"
  const baseSelect = "meeting_id, current_slide_index, allow_client_navigation, updated_at"

  const fullState = await supabase
    .from("meeting_state")
    .select(fullSelect)
    .eq("meeting_id", meetingId)
    .maybeSingle()

  if (!fullState.error) {
    return (fullState.data as MeetingState | null) ?? null
  }
  if (!isLegacyMeetingStateSchemaError(fullState.error)) {
    return null
  }

  const legacyState = await supabase
    .from("meeting_state")
    .select(baseSelect)
    .eq("meeting_id", meetingId)
    .maybeSingle()

  if (legacyState.error || !legacyState.data) {
    return null
  }

  return {
    meeting_id: legacyState.data.meeting_id,
    current_slide_index: legacyState.data.current_slide_index,
    allow_client_navigation: legacyState.data.allow_client_navigation,
    host_camera_frame: null,
    host_camera_updated_at: null,
    show_host_camera: true,
    updated_at: legacyState.data.updated_at,
  }
}

/**
 * Validate invite token and return meeting + state if valid.
 * Uses service role so guests (no auth) can be validated.
 */
export async function validateInviteToken(token: string): Promise<{
  ok: boolean
  meeting?: Meeting
  state?: MeetingState
  error?: string
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: "Not configured" }
  }
  const trimmed = token.trim()
  if (!trimmed) return { ok: false, error: "Token required" }

  const { data: invite, error: inviteError } = await supabase
    .from("meeting_invites")
    .select("id, meeting_id, expires_at")
    .eq("invite_token", trimmed)
    .maybeSingle()

  if (inviteError || !invite) {
    return { ok: false, error: "Invalid or expired link" }
  }
  const expiresAt = new Date(invite.expires_at)
  if (expiresAt < new Date()) {
    return { ok: false, error: "This invite link has expired" }
  }

  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("id, host_user_id, title, status, starts_at, ends_at, created_at, deck_id")
    .eq("id", invite.meeting_id)
    .single()

  if (meetingError || !meeting) {
    return { ok: false, error: "Meeting not found" }
  }

  const state = await loadMeetingState(invite.meeting_id)

  return {
    ok: true,
    meeting: meeting as Meeting,
    state: (state as MeetingState) ?? undefined,
  }
}

/**
 * Generate a random invite token (url-safe).
 */
export function generateInviteToken(): string {
  const bytes = new Uint8Array(24)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  }
  const b64 = typeof Buffer !== "undefined"
    ? Buffer.from(bytes).toString("base64url")
    : btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  return b64
}

/**
 * Create meeting_state row if missing (e.g. when meeting is created).
 */
export async function ensureMeetingState(meetingId: string): Promise<MeetingState | null> {
  if (!supabase) return null
  const { data: existing } = await supabase
    .from("meeting_state")
    .select("*")
    .eq("meeting_id", meetingId)
    .maybeSingle()
  if (existing) return existing as MeetingState
  const { data: inserted, error } = await supabase
    .from("meeting_state")
    .insert({ meeting_id: meetingId, current_slide_index: 0 })
    .select()
    .single()
  if (error) return null
  return inserted as MeetingState
}
