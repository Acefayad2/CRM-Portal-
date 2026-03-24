/**
 * POST /api/auth/request-password-change
 *
 * Sends a 6-digit code via SMS to the user's registered phone. Code expires in 5 minutes.
 */
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { sendTelnyxSms } from "@/lib/telnyx"

const CODE_EXPIRY_MINUTES = 5

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST() {
  try {
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: "You must be signed in." }, { status: 401 })

    const phone = user.user_metadata?.phone
    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "No phone number on file. Add a phone in your profile to change password via SMS." },
        { status: 400 }
      )
    }

    if (!supabase) return NextResponse.json({ error: "Service not configured. Contact support." }, { status: 503 })

    const code = generateCode()
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString()

    await supabase.from("password_change_codes").delete().eq("user_id", user.id)
    await supabase.from("password_change_codes").insert({ user_id: user.id, code, expires_at: expiresAt })

    const body = `Your Pantheon password change code is: ${code}. Valid for ${CODE_EXPIRY_MINUTES} minutes.`
    const result = await sendTelnyxSms({ to: phone, body })
    if (!result.ok) {
      return NextResponse.json({ error: "Failed to send code. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ success: true, expiresInMinutes: CODE_EXPIRY_MINUTES })
  } catch (err) {
    console.error("[api/auth/request-password-change] Error:", err)
    return NextResponse.json({ error: "Failed to send code. Please try again." }, { status: 500 })
  }
}
