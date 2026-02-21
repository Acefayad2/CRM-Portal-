/**
 * GET /api/calendar/feed/token - get or create feed token and return subscribe URL (authenticated)
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { isSupabaseConfigured } from "@/lib/supabase"
import { randomBytes } from "crypto"

function generateToken(): string {
  return randomBytes(24).toString("base64url")
}

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Calendar not configured" }, { status: 503 })
    }
    const supabaseClient = await createClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: existing } = await supabase
      .from("calendar_feed_tokens")
      .select("token")
      .eq("user_id", user.id)
      .single()

    let token: string
    if (existing?.token) {
      token = existing.token
    } else {
      token = generateToken()
      await supabase.from("calendar_feed_tokens").upsert(
        { user_id: user.id, token },
        { onConflict: "user_id" }
      )
    }

    let origin = process.env.NEXT_PUBLIC_APP_URL || ""
    if (!origin && process.env.VERCEL_URL) origin = "https://" + process.env.VERCEL_URL
    if (!origin && request.url) {
      try {
        origin = new URL(request.url).origin
      } catch {
        // leave origin empty if URL parsing fails
      }
    }
    const feedUrl = origin
      ? `${origin}/api/calendar/feed?token=${encodeURIComponent(token)}`
      : `/api/calendar/feed?token=${encodeURIComponent(token)}`

    return NextResponse.json({ feedUrl, token })
  } catch (err) {
    console.error("[api/calendar/feed/token] Error:", err)
    return NextResponse.json({ error: "Failed to get feed URL" }, { status: 500 })
  }
}
