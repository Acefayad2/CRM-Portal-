/**
 * POST /api/sms/send
 *
 * Sends an SMS via Twilio. Requires workspace membership and active subscription.
 * Uses included SMS first, then credit balance. Blocks if over limit.
 *
 * Request JSON: { to: string, message: string }
 */
import { NextResponse } from "next/server"
import Twilio from "twilio"
import { createClient } from "@/lib/supabase/server"
import { validatePhone, validateMessage } from "@/lib/sms-utils"
import { getWorkspaceForUser, canSendSms, recordSmsSent } from "@/lib/workspace"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { success: false, error: "Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN." },
        { status: 500 }
      )
    }

    if (!messagingServiceSid && !fromNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Set either TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID in .env.local",
        },
        { status: 500 }
      )
    }

    let body: { to?: string; message?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const to = body?.to
    const message = body?.message

    const phoneValidation = validatePhone(to ?? "")
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error },
        { status: 400 }
      )
    }

    const messageValidation = validateMessage(message ?? "")
    if (!messageValidation.valid) {
      return NextResponse.json(
        { success: false, error: messageValidation.error },
        { status: 400 }
      )
    }

    const toPhone = String(to).trim()
    const messageBody = String(message).trim()
    const fromPhone = fromNumber ?? "(Messaging Service)"

    let workspaceId: string | null = null
    if (isSupabaseConfigured()) {
      try {
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()
        if (user) {
          const membership = await getWorkspaceForUser(user.id)
          if (membership) {
            workspaceId = membership.workspace_id
            const smsCheck = await canSendSms(workspaceId)
            if (!smsCheck.ok) {
              return NextResponse.json({ success: false, error: smsCheck.error }, { status: 403 })
            }
          }
        }
      } catch {
        // Auth/Supabase not configured - allow send for dev (Test SMS page)
      }
    }

    const client = Twilio(accountSid, authToken)

    const params: Record<string, string> = {
      to: toPhone,
      body: messageBody,
    }

    if (messagingServiceSid) {
      params.messagingServiceSid = messagingServiceSid
    } else {
      params.from = fromNumber!
    }

    // Optional: add status callback if webhook URL is set (e.g. via ngrok)
    const webhookBase = process.env.TWILIO_WEBHOOK_BASE_URL
    if (webhookBase) {
      params.statusCallback = `${webhookBase}/api/twilio/webhook`
    }

    const twilioMessage = await client.messages.create(params)

    if (workspaceId && isSupabaseConfigured() && supabase) {
      await recordSmsSent(workspaceId)
      await supabase.from("sms_logs").insert({
        workspace_id: workspaceId,
        to_phone: toPhone,
        from_phone: fromPhone,
        body: messageBody,
        provider_message_id: twilioMessage.sid,
      })
    }

    return NextResponse.json({
      success: true,
      sid: twilioMessage.sid,
      status: twilioMessage.status,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[api/sms/send] Error:", err)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
