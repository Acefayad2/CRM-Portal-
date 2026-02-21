/**
 * POST /api/auth/confirm-delete-account
 *
 * Body: { code: string }
 * Verifies the SMS code and permanently deletes the user's account.
 */
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

const PURPOSE = "account_delete"

export async function POST(request: Request) {
  try {
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
    }

    let body: { code?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const code = body?.code?.trim()
    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required. Request a code first." },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json({ error: "Service not configured." }, { status: 503 })
    }

    const { data: row, error: codeError } = await supabase
      .from("sms_verification_codes")
      .select("id, expires_at")
      .eq("user_id", user.id)
      .eq("purpose", PURPOSE)
      .eq("code", code)
      .single()

    if (codeError || !row) {
      return NextResponse.json({ error: "Invalid or expired code. Request a new code." }, { status: 400 })
    }

    if (new Date(row.expires_at) < new Date()) {
      await supabase.from("sms_verification_codes").delete().eq("id", row.id)
      return NextResponse.json({ error: "Code has expired. Request a new code." }, { status: 400 })
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error("[confirm-delete-account] deleteUser error:", deleteError)
      return NextResponse.json(
        { error: deleteError.message ?? "Failed to delete account." },
        { status: 500 }
      )
    }

    await supabase.from("sms_verification_codes").delete().eq("id", row.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[confirm-delete-account] Error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
