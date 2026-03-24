/**
 * POST /api/calendar/time-slot-request
 * When a teammate sends a time slot request, notify the calendar owner (teammate) by SMS
 * to the phone number on file. Message: "[Requester name] has requested a time slot at [timeslot]."
 */
import { NextResponse } from "next/server"
import { sendTelnyxSms } from "@/lib/telnyx"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser, canSendSms, recordSmsSent } from "@/lib/workspace"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { validatePhone } from "@/lib/sms-utils"
import { getEmailTemplate, renderTemplate } from "@/lib/email-templates"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    const authClient = await createClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const requesterMembership = await getWorkspaceForUser(user.id)
    if (!requesterMembership) {
      return NextResponse.json({ error: "You are not in a workspace" }, { status: 403 })
    }

    let body: {
      teammateId?: string
      date?: string
      startTime?: string
      endTime?: string
      title?: string
      message?: string
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const teammateId = typeof body.teammateId === "string" ? body.teammateId.trim() : ""
    const date = typeof body.date === "string" ? body.date.trim() : ""
    const startTime = typeof body.startTime === "string" ? body.startTime.trim() : ""
    const endTime = typeof body.endTime === "string" ? body.endTime.trim() : ""
    const title = typeof body.title === "string" ? body.title.trim() : ""

    if (!teammateId) {
      return NextResponse.json({ error: "teammateId is required" }, { status: 400 })
    }
    if (!date || !startTime || !endTime) {
      return NextResponse.json({ error: "date, startTime, and endTime are required" }, { status: 400 })
    }

    // Requester and teammate must be in the same workspace
    const { data: teammateMembership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", teammateId)
      .eq("workspace_id", requesterMembership.workspace_id)
      .single()

    if (!teammateMembership) {
      return NextResponse.json({ error: "Teammate not found in your workspace" }, { status: 404 })
    }

    const { data: teammateUser } = await supabase.auth.admin.getUserById(teammateId)
    const teammateMeta = teammateUser?.user?.user_metadata ?? {}
    const teammatePrivacy = (teammateMeta.privacy as Record<string, unknown>) ?? {}
    if (teammatePrivacy.allowTimeSlotRequests === false) {
      return NextResponse.json(
        { error: "This teammate does not accept time slot requests" },
        { status: 403 }
      )
    }

    const phone = teammateUser?.user?.user_metadata?.phone
    const teammatePhone = typeof phone === "string" ? phone.trim() : ""
    const teammateEmail = teammateUser?.user?.email?.trim()

    if (!teammatePhone && !teammateEmail) {
      return NextResponse.json({
        ok: true,
        smsSent: false,
        error: "Teammate has no phone or email on file",
      })
    }

    const workspaceId = requesterMembership.workspace_id

    const meta = user.user_metadata ?? {}
    const firstName = meta.first_name ?? meta.firstName ?? ""
    const lastName = meta.last_name ?? meta.lastName ?? ""
    const requesterName =
      [firstName, lastName].filter(Boolean).join(" ") ||
      user.email?.split("@")[0] ||
      "A teammate"

    const dateFormatted = date ? new Date(date + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : date
    const timeStr = `${startTime}–${endTime}`
    const sendTimeSlotRequestEmail = async () => {
      if (!teammateEmail) return
      const template = await getEmailTemplate("time_slot_request", workspaceId)
      if (!template) return
      const message = typeof body.message === "string" ? body.message : ""
      const { subject, html, text } = renderTemplate(
        template.subject,
        template.body_html,
        template.body_text,
        { requesterName, date: dateFormatted, time: timeStr, title: title || "", message }
      )
      await sendEmail({ to: teammateEmail, subject, html, text })
    }

    if (teammatePhone) {
      const phoneValidation = validatePhone(teammatePhone)
      if (!phoneValidation.valid) {
        await sendTimeSlotRequestEmail()
        return NextResponse.json({
          ok: true,
          smsSent: false,
          error: "Teammate phone on file is invalid; notification sent by email if configured.",
        })
      }
    } else {
      await sendTimeSlotRequestEmail()
      return NextResponse.json({
        ok: true,
        smsSent: false,
        message: "Teammate has no phone; notification sent by email if configured.",
      })
    }
    const smsCheck = await canSendSms(workspaceId)
    if (!smsCheck.ok) {
      return NextResponse.json({ error: smsCheck.error ?? "Cannot send SMS" }, { status: 403 })
    }

    const timeSlot = `${dateFormatted}, ${startTime}–${endTime}`
    const messageBody = `${requesterName} has requested a time slot on your calendar: ${timeSlot}.${title ? ` "${title}"` : ""}`

    if (!process.env.TELNYX_API_KEY) {
      return NextResponse.json({ error: "SMS is not configured" }, { status: 500 })
    }
    if (!process.env.TELNYX_PHONE_NUMBER) {
      return NextResponse.json({ error: "Set TELNYX_PHONE_NUMBER in environment variables" }, { status: 500 })
    }

    const result = await sendTelnyxSms({ to: teammatePhone, body: messageBody })
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Failed to send SMS" }, { status: 500 })
    }
    await recordSmsSent(workspaceId)
    await supabase.from("sms_logs").insert({
      workspace_id: workspaceId,
      to_phone: teammatePhone,
      from_phone: process.env.TELNYX_PHONE_NUMBER ?? "",
      body: messageBody,
      provider_message_id: result.messageId ?? null,
    })
    await sendTimeSlotRequestEmail()
    return NextResponse.json({ ok: true, smsSent: true, sid: result.messageId })
  } catch (err) {
    console.error("[api/calendar/time-slot-request] Error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send notification" },
      { status: 500 }
    )
  }
}
