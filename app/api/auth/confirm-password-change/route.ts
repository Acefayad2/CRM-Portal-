/**
 * POST /api/auth/confirm-password-change
 *
 * Body: { code: string, newPassword: string }
 * Verifies the SMS code and updates the user's password. Code must be used within 5 minutes.
 */
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

const MIN_PASSWORD_LENGTH = 6

export async function POST(request: Request) {
  try {
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
    }

    let body: { code?: string; newPassword?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const code = body?.code?.trim()
    const newPassword = body?.newPassword

    if (!code) {
      return NextResponse.json({ error: "Verification code is required." }, { status: 400 })
    }
    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json({ error: "Service not configured." }, { status: 503 })
    }

    const { data: row, error: fetchError } = await supabase
      .from("password_change_codes")
      .select("id, expires_at")
      .eq("user_id", user.id)
      .eq("code", code)
      .single()

    if (fetchError || !row) {
      return NextResponse.json({ error: "Invalid or expired code. Request a new code." }, { status: 400 })
    }

    const expiresAt = new Date(row.expires_at)
    if (expiresAt < new Date()) {
      await supabase.from("password_change_codes").delete().eq("id", row.id)
      return NextResponse.json({ error: "Code has expired. Request a new code." }, { status: 400 })
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updateError) {
      console.error("[confirm-password-change] updateUserById error:", updateError)
      return NextResponse.json(
        { error: updateError.message || "Failed to update password." },
        { status: 500 }
      )
    }

    await supabase.from("password_change_codes").delete().eq("user_id", user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/auth/confirm-password-change] Error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
