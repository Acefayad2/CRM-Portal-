/**
 * POST /api/auth/complete-profile
 *
 * Updates user profile with phone and birthday, sends verification SMS.
 * For users who signed up with Google (no phone in metadata).
 */
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { validatePhone } from "@/lib/sms-utils"
import { NextResponse } from "next/server"
import { sendTelnyxSms } from "@/lib/telnyx"

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function sendVerificationSms(to: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const body = `Your Pantheon verification code is: ${code}. Valid for 10 minutes.`
  const result = await sendTelnyxSms({ to, body })
  if (!result.ok) {
    console.error("[api/auth/complete-profile] Telnyx error:", result.error)
    return { ok: false, error: "Failed to send verification code. Please try again." }
  }
  return { ok: true }
}

export async function POST(request: Request) {
  try {
    let body: { phone?: string; birthday?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const phone = body.phone?.trim()
    const birthday = body.birthday?.trim()

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 })
    }

    const phoneValidation = validatePhone(phone)
    if (!phoneValidation.valid) {
      return NextResponse.json({ error: phoneValidation.error ?? "Invalid phone number" }, { status: 400 })
    }

    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be signed in to complete your profile." }, { status: 401 })
    }

    if (user.user_metadata?.phone_verified === true) {
      return NextResponse.json({ success: true })
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    if (supabase) {
      await supabase.from("phone_verification_codes").insert({
        user_id: user.id, phone, code, expires_at: expiresAt,
      })
    }

    const smsResult = await sendVerificationSms(phone, code)
    if (!smsResult.ok) {
      return NextResponse.json({ error: smsResult.error ?? "Failed to send verification code." }, { status: 503 })
    }

    const updatedMetadata = { ...user.user_metadata, phone, birthday: birthday || null, phone_verified: false }
    await supabaseAuth.auth.updateUser({ data: updatedMetadata })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/auth/complete-profile] Error:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
