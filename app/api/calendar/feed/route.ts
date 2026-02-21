/**
 * GET /api/calendar/feed?token=xxx - ICS subscription feed (no auth; token in URL for calendar apps)
 * Returns text/calendar so user can subscribe in Apple Calendar, Google Calendar (Add by URL), etc.
 */
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { isSupabaseConfigured } from "@/lib/supabase"
import { generateIcs, type CalendarEventForIcs } from "@/lib/calendar-ics"

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return new NextResponse("Calendar not configured", { status: 503 })
    }
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    if (!token?.trim()) {
      return new NextResponse("Missing token", { status: 400 })
    }

    const { data: feedRow } = await supabase
      .from("calendar_feed_tokens")
      .select("user_id")
      .eq("token", token.trim())
      .single()

    if (!feedRow?.user_id) {
      return new NextResponse("Invalid token", { status: 404 })
    }

    const { data: rows } = await supabase
      .from("calendar_events")
      .select("id, title, start_time, end_time, date, description, location, updated_at")
      .eq("user_id", feedRow.user_id)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    const events: CalendarEventForIcs[] = (rows ?? []).map((r) => ({
      id: String(r.id),
      title: r.title ?? "",
      start_time: r.start_time ?? "00:00",
      end_time: r.end_time ?? "00:00",
      date: r.date ?? "",
      description: r.description,
      location: r.location,
      updated_at: r.updated_at,
    }))

    const ics = generateIcs(events)
    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "private, max-age=300",
      },
    })
  } catch (err) {
    console.error("[api/calendar/feed] Error:", err)
    return new NextResponse("Failed to generate feed", { status: 500 })
  }
}
