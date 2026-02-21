/**
 * GET /api/calendar/google/status - whether current user has Google Calendar connected
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { isSupabaseConfigured } from "@/lib/supabase"

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ connected: false })
    }
    const supabaseClient = await createClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    if (!user) return NextResponse.json({ connected: false })

    const { data } = await supabase
      .from("calendar_integrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .single()

    return NextResponse.json({ connected: !!data })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
