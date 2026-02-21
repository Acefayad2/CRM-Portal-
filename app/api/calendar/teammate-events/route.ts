/**
 * GET /api/calendar/teammate-events?userId=xxx&start=yyyy-mm-dd&end=yyyy-mm-dd
 * Returns a teammate's calendar events for the date range when they're in the same workspace
 * and have "Share availability" on. Otherwise returns 403 or empty.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

function rowToEvent(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    startTime: row.start_time,
    endTime: row.end_time,
    date: row.date,
    day: new Date(String(row.date)).getDay() || 7,
    description: row.description ?? "",
    location: row.location ?? "",
    color: row.color ?? "bg-blue-500",
    isVisible: row.is_visible ?? true,
    isTimeBlock: row.is_time_block ?? false,
    attendees: Array.isArray(row.attendees) ? row.attendees : [],
    organizer: "Teammate",
    isRecurring: !!row.recurrence_pattern,
    recurrencePattern: row.recurrence_pattern ?? "weekly",
    recurrenceEndDate: row.recurrence_end_date ?? "",
  }
}

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ events: [] })
    }

    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teammateId = searchParams.get("userId")?.trim()
    const start = searchParams.get("start")?.trim()
    const end = searchParams.get("end")?.trim()

    if (!teammateId || !start || !end) {
      return NextResponse.json(
        { error: "userId, start, and end query params are required" },
        { status: 400 }
      )
    }

    const myMembership = await getWorkspaceForUser(user.id)
    if (!myMembership) {
      return NextResponse.json({ events: [] })
    }

    const { data: teammateMembership } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", myMembership.workspace_id)
      .eq("user_id", teammateId)
      .single()

    if (!teammateMembership) {
      return NextResponse.json({ error: "Teammate not in your workspace" }, { status: 403 })
    }

    const { data: teammateUser } = await supabase.auth.admin.getUserById(teammateId)
    const meta = teammateUser?.user?.user_metadata ?? {}
    const privacy = (meta.privacy as Record<string, unknown>) ?? {}
    if (privacy.shareAvailability === false) {
      return NextResponse.json({ events: [] })
    }

    const { data: rows, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", teammateId)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("[api/calendar/teammate-events] GET error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const events = (rows ?? []).map(rowToEvent)
    return NextResponse.json({ events })
  } catch (err) {
    console.error("[api/calendar/teammate-events] Error:", err)
    return NextResponse.json({ error: "Failed to load teammate events" }, { status: 500 })
  }
}
