/**
 * POST /api/auth/signup
 *
 * Create a new account. Rejects if email is already registered.
 * Sends SMS verification code to user's phone. User must verify before accessing the app.
 */
import { createClient } from "@/lib/supabase/server"
import { hasSupabaseBrowserEnv } from "@/lib/supabase/env"
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
    console.error("[api/auth/signup] Telnyx error:", result.error)
    return { ok: false, error: "Failed to send verification code. Please try again." }
  }
  return { ok: true }
}

export async function POST(request: Request) {
  try {
    if (!hasSupabaseBrowserEnv()) {
      return NextResponse.json(
        { error: "Sign-up is not configured. Please contact support." },
        { status: 503 }
      )
    }

    let body: {
      email?: string
      password?: string
      name?: string
      phone?: string
      birthday?: string
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const email = body.email?.trim()
    const password = body.password
    const phone = body.phone?.trim()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required for verification." },
        { status: 400 }
      )
    }

    const phoneValidation = validatePhone(phone)
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { error: phoneValidation.error ?? "Invalid phone number" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const smsVerificationEnabled = Boolean(
      supabase &&
      process.env.TELNYX_API_KEY &&
      process.env.TELNYX_PHONE_NUMBER
    )

    const phoneVerifiedByDefault = !smsVerificationEnabled

    const supabaseAuth = await createClient()
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: body.name?.trim(),
          phone,
          birthday: body.birthday?.trim() || null,
          phone_verified: phoneVerifiedByDefault,
        },
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        msg.includes("user already")
      ) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Sign-up failed. Please try again." },
        { status: 500 }
      )
    }

    if (smsVerificationEnabled) {
      const code = generateCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

      const { error: insertError } = await supabase
        .from("phone_verification_codes")
        .insert({
          user_id: data.user.id,
          phone,
          code,
          expires_at: expiresAt,
        })

      if (insertError) {
        return NextResponse.json(
          { error: "Could not initialize phone verification. Please try again." },
          { status: 503 }
        )
      }

      const smsResult = await sendVerificationSms(phone, code)
      if (!smsResult.ok) {
        return NextResponse.json(
          { error: smsResult.error ?? "Failed to send verification code." },
          { status: 503 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      user: { id: data.user.id, email: data.user.email },
      requiresPhoneVerification: smsVerificationEnabled,
      nextPath: smsVerificationEnabled ? "/verify-phone" : "/join-team?new=1",
    })
  } catch (err) {
    console.error("[api/auth/signup] Error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
