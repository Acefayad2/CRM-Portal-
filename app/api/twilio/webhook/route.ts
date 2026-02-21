/**
 * POST /api/twilio/webhook
 *
 * Accepts Twilio form-encoded payloads for:
 * 1) Inbound SMS ("A MESSAGE COMES IN")
 * 2) Status callbacks (queued/sent/delivered/failed)
 *
 * SETUP WITH NGROK (local dev):
 * 1. npm run dev
 * 2. ngrok http 3000
 * 3. Copy ngrok URL (e.g. https://abc123.ngrok.io)
 * 4. In .env.local add: TWILIO_WEBHOOK_BASE_URL=https://abc123.ngrok.io
 * 5. In Twilio Console -> Phone Numbers -> [Your Number]:
 *    - "A MESSAGE COMES IN" -> Webhook -> https://<ngrok-url>/api/twilio/webhook
 *    - "STATUS CALLBACK URL" -> https://<ngrok-url>/api/twilio/webhook
 * 6. Or for Messaging Service: Messaging Service -> Settings -> Inbound Settings
 *    - Request URL: https://<ngrok-url>/api/twilio/webhook
 *    - Status Callback: https://<ngrok-url>/api/twilio/webhook
 *
 * Twilio sends application/x-www-form-urlencoded. We use request.formData() or
 * request.text() + URLSearchParams to parse.
 */
import { NextResponse } from "next/server"
import { upsertInboundMessage, updateMessageStatus, normalizeTwilioStatus } from "@/lib/sms-db"

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? ""

    let params: Record<string, string> = {}

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text()
      const search = new URLSearchParams(text)
      search.forEach((v, k) => {
        params[k] = v
      })
    } else {
      return NextResponse.json(
        { error: "Expected application/x-www-form-urlencoded" },
        { status: 400 }
      )
    }

    const messageSid = params.MessageSid
    const messageStatus = params.MessageStatus

    // Status callback: MessageStatus = queued | sent | delivered | failed
    if (messageStatus) {
      console.log("[twilio/webhook] Status callback:", {
        MessageSid: messageSid,
        MessageStatus: messageStatus,
      })
      if (messageSid) {
        await updateMessageStatus(messageSid, normalizeTwilioStatus(messageStatus))
      }
      return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } })
    }

    // Inbound SMS: From, To, Body
    const from = params.From
    const to = params.To
    const body = params.Body

    if (from && to && body !== undefined) {
      console.log("[twilio/webhook] Inbound SMS:", {
        From: from,
        To: to,
        Body: body,
        MessageSid: messageSid,
      })
      await upsertInboundMessage({
        from_phone: from,
        to_phone: to,
        body: body ?? "",
        provider_message_id: messageSid ?? "",
      })
    }

    return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } })
  } catch (err) {
    console.error("[twilio/webhook] Error:", err)
    return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } })
  }
}
