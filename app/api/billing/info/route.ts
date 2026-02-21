/**
 * GET /api/billing/info
 *
 * Returns billing info for the current user's workspace.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser, getBillingInfo } from "@/lib/workspace"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    let authClient
    try {
      authClient = await createClient()
    } catch {
      return NextResponse.json({ error: "Auth not configured" }, { status: 503 })
    }
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    if (!membership) {
      return NextResponse.json({ workspace: null, billing: null })
    }

    const billing = await getBillingInfo(membership.workspace_id)
    const workspaceRes = await supabase.from("workspaces").select("id, name, team_code").eq("id", membership.workspace_id).single()

    return NextResponse.json({
      workspace: workspaceRes.data,
      membership: { role: membership.role },
      billing,
    })
  } catch (err) {
    console.error("[billing/info] Error:", err)
    return NextResponse.json({ error: "Failed to load billing" }, { status: 500 })
  }
}
