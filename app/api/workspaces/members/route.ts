/**
 * GET /api/workspaces/members
 * Returns workspace members for the current user's workspace.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export interface WorkspaceMember {
  id: string
  email: string
  role: string
  shareAvailability: boolean
  allowTimeSlotRequests: boolean
}

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    if (!membership) {
      return NextResponse.json({ members: [], teamCode: null, currentUserRole: null })
    }

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("team_code")
      .eq("id", membership.workspace_id)
      .single()

    const { data: membersData } = await supabase
      .from("workspace_members")
      .select("user_id, role")
      .eq("workspace_id", membership.workspace_id)

    if (!membersData?.length) {
      return NextResponse.json({
        members: [],
        currentUserId: user.id,
        teamCode: workspace?.team_code ?? null,
        currentUserRole: membership.role,
      })
    }

    const members: WorkspaceMember[] = []
    const currentUserId = user.id
    for (const m of membersData) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(m.user_id)
        const meta = userData?.user?.user_metadata ?? {}
        const privacy = (meta.privacy as Record<string, unknown>) ?? {}
        const shareAvailability = privacy.shareAvailability !== false
        const allowTimeSlotRequests = privacy.allowTimeSlotRequests !== false
        members.push({
          id: m.user_id,
          email: userData?.user?.email ?? "Unknown",
          role: m.role,
          shareAvailability,
          allowTimeSlotRequests,
        })
      } catch {
        members.push({ id: m.user_id, email: "Unknown", role: m.role, shareAvailability: true, allowTimeSlotRequests: true })
      }
    }

    return NextResponse.json({
      members,
      currentUserId,
      teamCode: workspace?.team_code ?? null,
      currentUserRole: membership.role,
    })
  } catch (err) {
    console.error("[workspaces/members] Error:", err)
    return NextResponse.json({ error: "Failed to load members" }, { status: 500 })
  }
}
