/**
 * POST /api/profile/privacy - update current user's privacy settings (no verification required)
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: {
      profileVisibility?: string
      showEmail?: boolean
      showPhone?: boolean
      allowTimeSlotRequests?: boolean
      shareAvailability?: boolean
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const metadata = user.user_metadata ?? {}
    const currentPrivacy = (metadata.privacy as Record<string, unknown>) ?? {}
    const updatedPrivacy = {
      ...currentPrivacy,
      ...(body.profileVisibility !== undefined && { profileVisibility: body.profileVisibility }),
      ...(body.showEmail !== undefined && { showEmail: body.showEmail }),
      ...(body.showPhone !== undefined && { showPhone: body.showPhone }),
      ...(body.allowTimeSlotRequests !== undefined && { allowTimeSlotRequests: body.allowTimeSlotRequests }),
      ...(body.shareAvailability !== undefined && { shareAvailability: body.shareAvailability }),
    }

    if (!supabase) {
      return NextResponse.json({ error: "Service not configured." }, { status: 503 })
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...metadata, privacy: updatedPrivacy },
    })
    if (error) {
      console.error("[profile/privacy] updateUserById error:", error)
      return NextResponse.json({ error: error.message ?? "Failed to update privacy" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[profile/privacy] POST Error:", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
