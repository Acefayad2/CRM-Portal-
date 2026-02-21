/**
 * POST /api/calendar/reminders
 *
 * Sends appointment reminders (SMS) for events that start in ~24 hours.
 * Recipients: linked CRM client + any attendee phone numbers.
 * Intended to be called by a cron job (e.g. Vercel Cron every 15 min).
 *
 * Optional: pass CRON_SECRET in header "x-cron-secret" or query "secret" to protect the endpoint.
 */
import { NextResponse } from "next/server"
import Twilio from "twilio"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { canSendSms, recordSmsSent } from "@/lib/workspace"
import { validatePhone } from "@/lib/sms-utils"

const REMINDER_WINDOW_HOURS_MIN = 23.5
const REMINDER_WINDOW_HOURS_MAX = 24.5

function eventStartInWindow(row: { date: string; start_time: string }): boolean {
  const dateStr = String(row.date)
  const timeStr = String(row.start_time).trim()
  const [h = "0", m = "0"] = timeStr.split(":").map((s) => s.trim())
  const eventStart = new Date(`${dateStr}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00.000Z`)
  const now = new Date()
  const min = new Date(now.getTime() + REMINDER_WINDOW_HOURS_MIN * 60 * 60 * 1000)
  const max = new Date(now.getTime() + REMINDER_WINDOW_HOURS_MAX * 60 * 60 * 1000)
  return eventStart >= min && eventStart <= max
}

function formatEventTime(date: string, startTime: string, endTime: string): string {
  const d = new Date(`${date}T12:00:00`)
  const dateFormatted = d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return `${dateFormatted}, ${startTime}–${endTime}`
}

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const headerSecret = request.headers.get("x-cron-secret")
      const url = new URL(request.url)
      const querySecret = url.searchParams.get("secret")
      if (headerSecret !== cronSecret && querySecret !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
    if (!accountSid || !authToken) {
      return NextResponse.json({ error: "SMS (Twilio) not configured" }, { status: 503 })
    }
    if (!messagingServiceSid && !fromNumber) {
      return NextResponse.json({ error: "Set TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID" }, { status: 503 })
    }

    const { data: rows, error } = await supabase
      .from("calendar_events")
      .select("id, user_id, workspace_id, title, start_time, end_time, date, location, client_id, attendee_phones")
      .is("reminder_sent_at", null)
      .not("date", "is", null)

    if (error) {
      console.error("[api/calendar/reminders] fetch events error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const eventsInWindow = (rows ?? []).filter((r) => eventStartInWindow(r))
    const twilioClient = Twilio(accountSid, authToken)
    const fromPhone = fromNumber ?? "(Messaging Service)"
    const results: { eventId: string; sent: number; errors: string[] }[] = []

    for (const event of eventsInWindow) {
      const workspaceId = event.workspace_id ?? null
      if (!workspaceId) {
        results.push({ eventId: event.id, sent: 0, errors: ["No workspace"] })
        continue
      }

      const smsCheck = await canSendSms(workspaceId)
      if (!smsCheck.ok) {
        results.push({ eventId: event.id, sent: 0, errors: [smsCheck.error ?? "SMS not allowed"] })
        continue
      }

      const phones: string[] = []

      if (event.client_id) {
        const { data: client } = await supabase
          .from("clients")
          .select("phone")
          .eq("id", event.client_id)
          .single()
        const p = client?.phone?.trim()
        if (p) phones.push(p)
      }

      const attendeePhones = Array.isArray(event.attendee_phones) ? event.attendee_phones : []
      for (const p of attendeePhones) {
        if (typeof p === "string" && p.trim()) phones.push(p.trim())
      }

      const uniquePhones = [...new Set(phones)]
      const validPhones = uniquePhones.filter((p) => validatePhone(p).valid)
      const timeStr = formatEventTime(event.date, event.start_time, event.end_time)
      const messageBody = `Reminder: You have an appointment "${event.title}" on ${timeStr}.${event.location ? ` Location: ${event.location}` : ""}`

      let sent = 0
      const errors: string[] = []

      for (const to of validPhones) {
        try {
          const params: Record<string, string> = {
            to,
            body: messageBody,
          }
          if (messagingServiceSid) params.messagingServiceSid = messagingServiceSid
          else params.from = fromNumber!

          const webhookBase = process.env.TWILIO_WEBHOOK_BASE_URL
          if (webhookBase) params.statusCallback = `${webhookBase}/api/twilio/webhook`

          const twilioMessage = await twilioClient.messages.create(params)
          await recordSmsSent(workspaceId)
          await supabase.from("sms_logs").insert({
            workspace_id: workspaceId,
            to_phone: to,
            from_phone: fromPhone,
            body: messageBody,
            provider_message_id: twilioMessage.sid ?? "",
          })
          sent++
        } catch (e) {
          errors.push(`${to}: ${e instanceof Error ? e.message : "Send failed"}`)
        }
      }

      // Mark reminder as sent so we don't retry (even if no recipients this time)
      await supabase
        .from("calendar_events")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", event.id)

      results.push({ eventId: event.id, sent, errors })
    }

    return NextResponse.json({
      ok: true,
      checked: rows?.length ?? 0,
      inWindow: eventsInWindow.length,
      results,
    })
  } catch (err) {
    console.error("[api/calendar/reminders] Error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send reminders" },
      { status: 500 }
    )
  }
}
