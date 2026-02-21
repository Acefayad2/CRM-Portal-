/**
 * POST /api/workspaces/invite-by-sms
 * Body: { phone: string }
 * Admin only. Creates an invite, sends SMS with link to join the team. Uses workspace SMS.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getWorkspaceForUser } from "@/lib/workspace"
import { canSendSms, recordSmsSent } from "@/lib/workspace"
import { validatePhone } from "@/lib/sms-utils"
import Twilio from "twilio"

const INVITE_EXPIRES_DAYS = 7

function generateToken(): string {
  return `${Date.now().toString(36)}-${crypto.getRandomValues(new Uint8Array(12)).reduce((a, b) => a + b.toString(36), "")}`
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 400 })
    if (membership.role !== "admin") {
      return NextResponse.json({ error: "Only admins can invite by SMS" }, { status: 403 })
    }

    let body: { phone?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const phone = body?.phone?.trim()
    const validation = validatePhone(phone ?? "")
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const smsCheck = await canSendSms(membership.workspace_id)
    if (!smsCheck.ok) {
      return NextResponse.json({ error: smsCheck.error }, { status: 403 })
    }

    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRES_DAYS)

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", membership.workspace_id)
      .single()

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.headers.get("host")
        ? `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}`
        : "http://localhost:3000")
    const joinUrl = `${baseUrl.replace(/\/$/, "")}/join-invite?token=${encodeURIComponent(token)}`

    const { error: insertError } = await supabase.from("workspace_invites").insert({
      workspace_id: membership.workspace_id,
      phone: phone!,
      token,
      created_by: user.id,
      expires_at: expiresAt.toISOString(),
    })

    if (insertError) {
      console.error("[invite-by-sms] insert error:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const workspaceName = workspace?.name ?? "Our team"
    const message = `You're invited to join ${workspaceName}! Sign up or log in here to join: ${joinUrl}`

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: "SMS (Twilio) is not configured" }, { status: 503 })
    }
    if (!messagingServiceSid && !fromNumber) {
      return NextResponse.json({ error: "Set TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID" }, { status: 503 })
    }

    const twilio = Twilio(accountSid, authToken)
    const params: Record<string, string> = {
      to: phone!,
      body: message,
    }
    if (messagingServiceSid) params.messagingServiceSid = messagingServiceSid
    else params.from = fromNumber!

    await twilio.messages.create(params)
    await recordSmsSent(membership.workspace_id)

    return NextResponse.json({ success: true, message: "Invite sent" })
  } catch (err) {
    console.error("[invite-by-sms] Error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send invite" },
      { status: 500 }
    )
  }
}
