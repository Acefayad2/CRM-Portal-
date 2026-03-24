/**
 * GET /api/sms/config
 * Returns the configured "from" number for display (not sensitive).
 */
import { NextResponse } from "next/server"

export async function GET() {
  const fromNumber = process.env.TELNYX_PHONE_NUMBER ?? "Not configured"
  return NextResponse.json({ from: fromNumber })
}
