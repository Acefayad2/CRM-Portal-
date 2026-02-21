/**
 * POST /api/auth/signup
 *
 * Create a new account. Rejects if email is already registered.
 * Sends SMS verification code to user's phone. User must verify before accessing the app.
 */
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { validatePhone } from "@/lib/sms-utils"
import { NextResponse } from "next/server"
import Twilio from "twilio"

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function sendVerificationSms(to: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

  if (!accountSid || !authToken) {
    return { ok: false, error: "SMS is not configured. Please contact support." }
  }
  if (!messagingServiceSid && !fromNumber) {
    return { ok: false, error: "SMS sender is not configured. Please contact support." }
  }

  try {
    const client = Twilio(accountSid, authToken)
    const body = `Your Pantheon verification code is: ${code}. Valid for 10 minutes.`
    const params: Record<string, string> = { to, body }
    if (messagingServiceSid) params.messagingServiceSid = messagingServiceSid
    else params.from = fromNumber!
    await client.messages.create(params)
    return { ok: true }
  } catch (err) {
    console.error("[api/auth/signup] Twilio error:", err)
    return { ok: false, error: "Failed to send verification code. Please try again." }
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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

    const supabaseAuth = await createClient()
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: body.name?.trim(),
          phone,
          birthday: body.birthday?.trim() || null,
          phone_verified: false,
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

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    if (supabase) {
      await supabase.from("phone_verification_codes").insert({
        user_id: data.user.id,
        phone,
        code,
        expires_at: expiresAt,
      })
    }

    const smsResult = await sendVerificationSms(phone, code)
    if (!smsResult.ok) {
      return NextResponse.json(
        { error: smsResult.error ?? "Failed to send verification code." },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      user: { id: data.user.id, email: data.user.email },
    })
  } catch (err) {
    console.error("[api/auth/signup] Error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
