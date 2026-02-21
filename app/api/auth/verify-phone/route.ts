/**
 * POST /api/auth/verify-phone
 *
 * Verifies the SMS code and marks user as phone_verified.
 * Requires authenticated user (session).
 */
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    let body: { code?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const code = String(body?.code ?? "").trim()
    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "Please enter the 6-digit verification code." },
        { status: 400 }
      )
    }

    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to verify." },
        { status: 401 }
      )
    }

    const verified = user.user_metadata?.phone_verified === true
    if (verified) {
      return NextResponse.json({ success: true })
    }

    if (!supabase) {
      return NextResponse.json(
        { error: "Verification is not configured. Please contact support." },
        { status: 503 }
      )
    }

    const { data: row } = await supabase
      .from("phone_verification_codes")
      .select("id")
      .eq("user_id", user.id)
      .eq("code", code)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .single()

    if (!row) {
      return NextResponse.json(
        { error: "Invalid or expired code. Please try again or request a new code." },
        { status: 400 }
      )
    }

    await supabase
      .from("phone_verification_codes")
      .delete()
      .eq("id", row.id)

    const updatedMetadata = {
      ...user.user_metadata,
      phone_verified: true,
    }
    await supabaseAuth.auth.updateUser({ data: updatedMetadata })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/auth/verify-phone] Error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
