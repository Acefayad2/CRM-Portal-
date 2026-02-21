/**
 * GET /api/calendar/google/callback - exchange code for tokens and store in calendar_integrations
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { isSupabaseConfigured } from "@/lib/supabase"

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")
  const origin = url.origin
  const redirectTo = `${origin}/portal/settings?tab=calendar`

  if (error) {
    return NextResponse.redirect(redirectTo + "&error=" + encodeURIComponent(error))
  }
  if (!code || !state) {
    return NextResponse.redirect(redirectTo + "&error=missing_code")
  }
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.redirect(redirectTo + "&error=not_configured")
  }

  let userId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString())
    userId = decoded.userId
    if (!userId) throw new Error("no userId")
  } catch {
    return NextResponse.redirect(redirectTo + "&error=invalid_state")
  }

  const supabaseClient = await createClient()
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  if (!user || user.id !== userId) {
    return NextResponse.redirect(redirectTo + "&error=unauthorized")
  }

  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(redirectTo + "&error=missing_config")
  }

  const redirectUri = `${origin}/api/calendar/google/callback`
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("[calendar/google/callback] token error:", err)
    return NextResponse.redirect(redirectTo + "&error=token_failed")
  }

  const data = (await res.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }
  const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString()

  await supabase.from("calendar_integrations").upsert(
    {
      user_id: user.id,
      provider: "google",
      access_token: data.access_token,
      refresh_token: data.refresh_token || null,
      calendar_id: "primary",
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" }
  )

  return NextResponse.redirect(redirectTo + "&google=connected")
}
