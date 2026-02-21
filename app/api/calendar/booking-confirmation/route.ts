/**
 * POST /api/calendar/booking-confirmation
 * Send booking confirmation email to the requester after a time-slot request is accepted.
 * Body: { requesterId: string, title: string, date: string, startTime: string, endTime: string, location?: string }
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { getEmailTemplate, renderTemplate } from "@/lib/email-templates"
import { sendEmail } from "@/lib/email"
import { supabase } from "@/lib/supabase"
import { isSupabaseConfigured } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let body: {
      requesterId?: string
      title?: string
      date?: string
      startTime?: string
      endTime?: string
      location?: string
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const requesterId = typeof body.requesterId === "string" ? body.requesterId.trim() : ""
    const title = typeof body.title === "string" ? body.title.trim() : "Meeting"
    const date = typeof body.date === "string" ? body.date.trim() : ""
    const startTime = typeof body.startTime === "string" ? body.startTime.trim() : ""
    const endTime = typeof body.endTime === "string" ? body.endTime.trim() : ""
    const location = typeof body.location === "string" ? body.location.trim() : ""

    if (!requesterId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "requesterId, date, startTime, endTime are required" },
        { status: 400 }
      )
    }

    const membership = await getWorkspaceForUser(user.id)
    const workspaceId = membership?.workspace_id ?? null

    const { data: requesterUser } = await supabase.auth.admin.getUserById(requesterId)
    const requesterEmail = requesterUser?.user?.email
    if (!requesterEmail?.trim()) {
      return NextResponse.json(
        { ok: false, emailSent: false, error: "Requester has no email" },
        { status: 200 }
      )
    }

    const dateFormatted = new Date(date + "T12:00:00").toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    const timeStr = `${startTime}–${endTime}`

    const template = await getEmailTemplate("booking_confirmation", workspaceId)
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 500 })
    }

    const { subject, html, text } = renderTemplate(
      template.subject,
      template.body_html,
      template.body_text,
      {
        title,
        date: dateFormatted,
        time: timeStr,
        location: location || undefined,
      }
    )

    const result = await sendEmail({
      to: requesterEmail,
      subject,
      html,
      text,
    })

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, emailSent: false, error: result.error },
        { status: 200 }
      )
    }

    return NextResponse.json({ ok: true, emailSent: true, id: result.id })
  } catch (err) {
    console.error("[api/calendar/booking-confirmation] Error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send confirmation" },
      { status: 500 }
    )
  }
}
