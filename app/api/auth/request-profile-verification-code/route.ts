/**
 * POST /api/auth/request-profile-verification-code
 *
 * Sends a 6-digit code via SMS to the user's phone. Required before saving profile/personal info changes.
 * Code expires in 5 minutes. Uses CRM/Twilio.
 */
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"
import Twilio from "twilio"

const PURPOSE = "profile_update"
const EXPIRY_MINUTES = 5

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST() {
  try {
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
    }

    const phone = user.user_metadata?.phone
    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "No phone number on file. Add a phone in your profile first." },
        { status: 400 }
      )
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

    if (!accountSid || !authToken || (!messagingServiceSid && !fromNumber)) {
      return NextResponse.json({ error: "SMS is not configured. Contact support." }, { status: 503 })
    }

    if (!supabase) {
      return NextResponse.json({ error: "Service not configured." }, { status: 503 })
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000).toISOString()

    await supabase
      .from("sms_verification_codes")
      .delete()
      .eq("user_id", user.id)
      .eq("purpose", PURPOSE)

    await supabase.from("sms_verification_codes").insert({
      user_id: user.id,
      code,
      purpose: PURPOSE,
      expires_at: expiresAt,
    })

    const client = Twilio(accountSid, authToken)
    const body = `Your Pantheon verification code is: ${code}. Valid for ${EXPIRY_MINUTES} minutes. Use this to authorize changes to your account.`
    const params: Record<string, string> = { to: phone, body }
    if (messagingServiceSid) params.messagingServiceSid = messagingServiceSid
    else params.from = fromNumber!
    await client.messages.create(params)

    return NextResponse.json({ success: true, expiresInMinutes: EXPIRY_MINUTES })
  } catch (err) {
    console.error("[request-profile-verification-code] Error:", err)
    return NextResponse.json(
      { error: "Failed to send code. Please try again." },
      { status: 500 }
    )
  }
}
