/**
 * GET /api/calendar/events - list current user's calendar events
 * POST /api/calendar/events - create event (and push to Google if connected)
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { isSupabaseConfigured } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import {
  createGoogleCalendarEvent,
  type CalendarEventPayload,
} from "@/lib/calendar-google"

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
    attendeePhones: Array.isArray(row.attendee_phones) ? row.attendee_phones : [],
    clientId: row.client_id ?? null,
    reminderSentAt: row.reminder_sent_at ?? null,
    organizer: "You",
    isRecurring: !!row.recurrence_pattern,
    recurrencePattern: row.recurrence_pattern ?? "weekly",
    recurrenceEndDate: row.recurrence_end_date ?? "",
    googleEventId: row.google_event_id ?? null,
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ events: [] })
    }
    const supabaseClient = await createClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    if (!user) return NextResponse.json({ events: [] })

    const membership = await getWorkspaceForUser(user.id)
    const workspaceId = membership?.workspace_id ?? null

    const { data: rows, error } = await supabaseClient
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("[api/calendar/events] GET error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const events = (rows ?? []).map(rowToEvent)
    return NextResponse.json({ events })
  } catch (err) {
    console.error("[api/calendar/events] Error:", err)
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Calendar not configured" }, { status: 503 })
    }
    const supabaseClient = await createClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    const workspaceId = membership?.workspace_id ?? null

    let body: {
      title: string
      startTime: string
      endTime: string
      date: string
      description?: string
      location?: string
      color?: string
      isVisible?: boolean
      isTimeBlock?: boolean
      attendees?: string[]
      recurrencePattern?: string
      recurrenceEndDate?: string
      clientId?: string | null
      attendeePhones?: string[]
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const title = String(body.title ?? "").trim()
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 })

    const startTime = String(body.startTime ?? "09:00")
    const endTime = String(body.endTime ?? "10:00")
    const date = String(body.date ?? new Date().toISOString().split("T")[0])

    let clientIdToInsert: string | null = null
    if (body.clientId && typeof body.clientId === "string") {
      const { data: client } = await supabaseClient
        .from("clients")
        .select("id")
        .eq("id", body.clientId.trim())
        .eq("user_id", user.id)
        .single()
      if (client) clientIdToInsert = client.id
    }

    const attendeePhones = Array.isArray(body.attendeePhones)
      ? body.attendeePhones.filter((p): p is string => typeof p === "string").map((p) => p.trim()).filter(Boolean)
      : []

    const { data: inserted, error } = await supabaseClient
      .from("calendar_events")
      .insert({
        user_id: user.id,
        workspace_id: workspaceId,
        title,
        start_time: startTime,
        end_time: endTime,
        date,
        description: body.description ?? null,
        location: body.location ?? null,
        color: body.color ?? null,
        is_visible: body.isVisible ?? true,
        is_time_block: body.isTimeBlock ?? false,
        attendees: body.attendees ?? [],
        recurrence_pattern: body.recurrencePattern ?? null,
        recurrence_end_date: body.recurrenceEndDate || null,
        client_id: clientIdToInsert,
        attendee_phones: attendeePhones,
      })
      .select("id, google_event_id")
      .single()

    if (error) {
      console.error("[api/calendar/events] POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let googleEventId: string | null = null
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET
    if (inserted && clientId && clientSecret && supabase) {
      const { data: integration } = await supabase
        .from("calendar_integrations")
        .select("access_token, refresh_token, expires_at, calendar_id")
        .eq("user_id", user.id)
        .eq("provider", "google")
        .single()
      if (integration?.access_token && integration?.refresh_token) {
        const calendarId = integration.calendar_id || "primary"
        const payload: CalendarEventPayload = {
          title,
          start_time: startTime,
          end_time: endTime,
          date,
          description: body.description ?? null,
          location: body.location ?? null,
        }
        try {
          googleEventId = await createGoogleCalendarEvent(
            {
              access_token: integration.access_token,
              refresh_token: integration.refresh_token,
              expires_at: integration.expires_at,
              calendar_id: calendarId,
            },
            clientId,
            clientSecret,
            calendarId,
            payload
          )
          if (googleEventId) {
            await supabase
              .from("calendar_events")
              .update({ google_event_id: googleEventId, updated_at: new Date().toISOString() })
              .eq("id", inserted.id)
          }
        } catch (e) {
          console.error("[api/calendar/events] Google push failed:", e)
        }
      }
    }

    const out = await supabaseClient
      .from("calendar_events")
      .select("*")
      .eq("id", inserted.id)
      .single()
    const event = out.data ? rowToEvent(out.data) : rowToEvent(inserted as unknown as Record<string, unknown>)
    return NextResponse.json({ event })
  } catch (err) {
    console.error("[api/calendar/events] POST Error:", err)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
