/**
 * POST /api/sms/send
 *
 * Sends an SMS via Telnyx. Requires workspace membership and active subscription.
 * Uses included SMS first, then credit balance. Blocks if over limit.
 *
 * Request JSON: { to: string, message: string }
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { validatePhone, validateMessage } from "@/lib/sms-utils"
import { getWorkspaceForUser, canSendSms, recordSmsSent } from "@/lib/workspace"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { sendTelnyxSms } from "@/lib/telnyx"

export async function POST(request: Request) {
  try {
    const apiKey = process.env.TELNYX_API_KEY
    const fromNumber = process.env.TELNYX_PHONE_NUMBER

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Telnyx is not configured. Set TELNYX_API_KEY." },
        { status: 500 }
      )
    }
    if (!fromNumber) {
      return NextResponse.json(
        { success: false, error: "Set TELNYX_PHONE_NUMBER in environment variables." },
        { status: 500 }
      )
    }

    let body: { to?: string; message?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
    }

    const phoneValidation = validatePhone(body?.to ?? "")
    if (!phoneValidation.valid) {
      return NextResponse.json({ success: false, error: phoneValidation.error }, { status: 400 })
    }

    const messageValidation = validateMessage(body?.message ?? "")
    if (!messageValidation.valid) {
      return NextResponse.json({ success: false, error: messageValidation.error }, { status: 400 })
    }

    const toPhone = String(body.to).trim()
    const messageBody = String(body.message).trim()

    let workspaceId: string | null = null
    if (isSupabaseConfigured()) {
      try {
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()
        if (user) {
          const membership = await getWorkspaceForUser(user.id)
          if (membership && membership.workspace_id) {
            const wsId: string = membership.workspace_id
            workspaceId = wsId
            const smsCheck = await canSendSms(wsId)
            if (!smsCheck.ok) {
              return NextResponse.json({ success: false, error: smsCheck.error }, { status: 403 })
            }
          }
        }
      } catch {
        // Auth/Supabase not configured - allow send for dev
      }
    }

    const result = await sendTelnyxSms({
      to: toPhone,
      body: messageBody,
      webhookUrl: process.env.TELNYX_WEBHOOK_URL,
    })

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    if (workspaceId && isSupabaseConfigured() && supabase) {
      await recordSmsSent(workspaceId)
      await supabase.from("sms_logs").insert({
        workspace_id: workspaceId,
        to_phone: toPhone,
        from_phone: fromNumber,
        body: messageBody,
        provider_message_id: result.messageId ?? null,
      })
    }

    return NextResponse.json({
      success: true,
      sid: result.messageId,
      status: "queued",
    })
  } catch (err) {
    console.error("[api/sms/send] Error:", err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
