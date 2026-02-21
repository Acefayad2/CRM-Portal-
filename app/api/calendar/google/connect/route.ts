/**
 * GET /api/calendar/google/connect - redirect to Google OAuth consent
 * User must be logged in; we store state and redirect to Google.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const SCOPE = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar"

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(new URL("/portal/settings?tab=calendar&error=missing_config", request.url))
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  const url = new URL(request.url)
  const origin = url.origin
  const redirectUri = `${origin}/api/calendar/google/callback`
  const state = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64url")
  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: SCOPE,
      access_type: "offline",
      prompt: "consent",
      state,
    })
  return NextResponse.redirect(authUrl)
}
