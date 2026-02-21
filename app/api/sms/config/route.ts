/**
 * GET /api/sms/config
 * Returns the configured "from" number for display (not sensitive).
 */
import { NextResponse } from "next/server"

export async function GET() {
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  const from = messagingServiceSid ? "Messaging Service" : fromNumber ?? "Not configured"
  return NextResponse.json({ from })
}
