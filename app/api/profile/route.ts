/**
 * GET /api/profile - current user's profile (for loading in settings)
 * POST /api/profile - update profile; requires verification code in body (SMS must be requested first)
 */
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { validatePhone } from "@/lib/sms-utils"

const PURPOSE = "profile_update"

export async function GET() {
  try {
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const metadata = user.user_metadata ?? {}
    const privacy = (metadata.privacy as Record<string, unknown>) ?? {}
    return NextResponse.json({
      email: user.email ?? "",
      firstName: metadata.first_name ?? metadata.firstName ?? "",
      lastName: metadata.last_name ?? metadata.lastName ?? "",
      phone: metadata.phone ?? "",
      title: metadata.title ?? "",
      bio: metadata.bio ?? "",
      privacy: {
        profileVisibility: (privacy.profileVisibility as string) ?? "team",
        showEmail: privacy.showEmail !== false,
        showPhone: privacy.showPhone !== false,
        allowTimeSlotRequests: privacy.allowTimeSlotRequests !== false,
        shareAvailability: privacy.shareAvailability !== false,
      },
    })
  } catch (err) {
    console.error("[profile] GET Error:", err)
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: {
      code?: string
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
      title?: string
      bio?: string
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const code = body.code?.trim()
    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required. Request a code first (Send code to my phone)." },
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

    if (body.phone !== undefined && body.phone !== "") {
      const validation = validatePhone(body.phone.trim())
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error ?? "Invalid phone number" }, { status: 400 })
      }
    }

    const metadata = user.user_metadata ?? {}
    const updatedMetadata: Record<string, unknown> = {
      ...metadata,
      first_name: body.firstName !== undefined ? body.firstName : (metadata.first_name ?? metadata.firstName),
      last_name: body.lastName !== undefined ? body.lastName : (metadata.last_name ?? metadata.lastName),
      phone: body.phone !== undefined ? body.phone.trim() : metadata.phone,
      title: body.title !== undefined ? body.title : metadata.title,
      bio: body.bio !== undefined ? body.bio : metadata.bio,
    }

    if (body.email !== undefined && body.email.trim() !== "" && body.email.trim() !== user.email) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email: body.email.trim(),
        user_metadata: updatedMetadata,
      })
      if (updateError) {
        console.error("[profile] updateUserById error:", updateError)
        return NextResponse.json({ error: updateError.message ?? "Failed to update profile" }, { status: 500 })
      }
    } else {
      const { error: updateError } = await supabaseAuth.auth.updateUser({
        data: updatedMetadata,
      })
      if (updateError) {
        console.error("[profile] updateUser error:", updateError)
        return NextResponse.json({ error: updateError.message ?? "Failed to update profile" }, { status: 500 })
      }
    }

    await supabase.from("sms_verification_codes").delete().eq("id", row.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[profile] POST Error:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
