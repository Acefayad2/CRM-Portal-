/**
 * PATCH /api/calendar/events/[id] - update event (and push to Google if connected)
 * DELETE /api/calendar/events/[id] - delete event (and remove from Google if synced)
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import {
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Calendar not configured" }, { status: 503 })
    }
    const { id } = await params
    const supabaseClient = await createClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let body: {
      title?: string
      startTime?: string
      endTime?: string
      date?: string
      description?: string
      location?: string
      color?: string
      isVisible?: boolean
      isTimeBlock?: boolean
      attendees?: string[]
      clientId?: string | null
      attendeePhones?: string[]
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { data: existing } = await supabaseClient
      .from("calendar_events")
      .select("id, title, start_time, end_time, date, description, location, google_event_id, client_id, attendee_phones")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 })

    const title = body.title !== undefined ? String(body.title).trim() : existing.title
    const startTime = body.startTime ?? existing.start_time
    const endTime = body.endTime ?? existing.end_time
    const date = body.date ?? existing.date

    let clientIdUpdate: string | null | undefined = undefined
    if (body.clientId !== undefined) {
      if (!body.clientId) {
        clientIdUpdate = null
      } else {
        const { data: client } = await supabaseClient
          .from("clients")
          .select("id")
          .eq("id", String(body.clientId).trim())
          .eq("user_id", user.id)
          .single()
        clientIdUpdate = client ? client.id : null
      }
    }

    const attendeePhonesUpdate =
      body.attendeePhones !== undefined
        ? body.attendeePhones.filter((p): p is string => typeof p === "string").map((p) => p.trim()).filter(Boolean)
        : undefined

    const { data: updated, error } = await supabaseClient
      .from("calendar_events")
      .update({
        title,
        start_time: startTime,
        end_time: endTime,
        date,
        description: body.description !== undefined ? body.description : existing.description,
        location: body.location !== undefined ? body.location : existing.location,
        color: body.color !== undefined ? body.color : undefined,
        is_visible: body.isVisible !== undefined ? body.isVisible : undefined,
        is_time_block: body.isTimeBlock !== undefined ? body.isTimeBlock : undefined,
        attendees: body.attendees !== undefined ? body.attendees : undefined,
        ...(clientIdUpdate !== undefined && { client_id: clientIdUpdate }),
        ...(attendeePhonesUpdate !== undefined && { attendee_phones: attendeePhonesUpdate }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[api/calendar/events] PATCH error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET
    const googleEventId = existing.google_event_id
    if (
      updated &&
      googleEventId &&
      clientId &&
      clientSecret &&
      supabase
    ) {
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
          description: updated.description ?? null,
          location: updated.location ?? null,
        }
        try {
          await updateGoogleCalendarEvent(
            {
              access_token: integration.access_token,
              refresh_token: integration.refresh_token,
              expires_at: integration.expires_at,
              calendar_id: calendarId,
            },
            clientId,
            clientSecret,
            calendarId,
            googleEventId,
            payload
          )
        } catch (e) {
          console.error("[api/calendar/events] Google update failed:", e)
        }
      }
    }

    return NextResponse.json({ event: rowToEvent(updated) })
  } catch (err) {
    console.error("[api/calendar/events] PATCH Error:", err)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Calendar not configured" }, { status: 503 })
    }
    const { id } = await params
    const supabaseClient = await createClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: existing } = await supabaseClient
      .from("calendar_events")
      .select("id, google_event_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (!existing) return NextResponse.json({ error: "Event not found" }, { status: 404 })

    const googleEventId = existing.google_event_id
    if (googleEventId && supabase) {
      const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
      const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET
      const { data: integration } = await supabase
        .from("calendar_integrations")
        .select("access_token, refresh_token, expires_at, calendar_id")
        .eq("user_id", user.id)
        .eq("provider", "google")
        .single()
      if (integration?.access_token && clientId && clientSecret) {
        const calendarId = integration.calendar_id || "primary"
        try {
          await deleteGoogleCalendarEvent(
            {
              access_token: integration.access_token,
              refresh_token: integration.refresh_token,
              expires_at: integration.expires_at,
              calendar_id: calendarId,
            },
            clientId,
            clientSecret,
            calendarId,
            googleEventId
          )
        } catch (e) {
          console.error("[api/calendar/events] Google delete failed:", e)
        }
      }
    }

    const { error } = await supabaseClient
      .from("calendar_events")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("[api/calendar/events] DELETE error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[api/calendar/events] DELETE Error:", err)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
