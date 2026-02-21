/**
 * POST /api/auth/resend-verification-code
 *
 * Sends a new verification code to the user's phone.
 * Rate limited by design - old codes are invalidated when new one is sent.
 */
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"
import Twilio from "twilio"

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST() {
  try {
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to resend." },
        { status: 401 }
      )
    }

    if (user.user_metadata?.phone_verified === true) {
      return NextResponse.json({ success: true })
    }

    const phone = user.user_metadata?.phone
    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "No phone number on file. Please sign up again." },
        { status: 400 }
      )
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

    if (!accountSid || !authToken || (!messagingServiceSid && !fromNumber)) {
      return NextResponse.json(
        { error: "SMS is not configured. Please contact support." },
        { status: 503 }
      )
    }

    if (!supabase) {
      return NextResponse.json(
        { error: "Verification is not configured. Please contact support." },
        { status: 503 }
      )
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await supabase.from("phone_verification_codes").delete().eq("user_id", user.id)

    await supabase.from("phone_verification_codes").insert({
      user_id: user.id,
      phone,
      code,
      expires_at: expiresAt,
    })

    const client = Twilio(accountSid, authToken)
    const body = `Your Pantheon verification code is: ${code}. Valid for 10 minutes.`
    const params: Record<string, string> = { to: phone, body }
    if (messagingServiceSid) params.messagingServiceSid = messagingServiceSid
    else params.from = fromNumber!
    await client.messages.create(params)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/auth/resend-verification-code] Error:", err)
    return NextResponse.json(
      { error: "Failed to send code. Please try again." },
      { status: 500 }
    )
  }
}
