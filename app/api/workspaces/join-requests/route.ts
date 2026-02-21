/**
 * GET /api/workspaces/join-requests
 * List pending join requests for the current user's workspace. Admin only.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getWorkspaceForUser } from "@/lib/workspace"

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 400 })
    if (membership.role !== "admin") {
      return NextResponse.json({ error: "Only admins can view join requests" }, { status: 403 })
    }

    const { data: requests, error } = await supabase
      .from("workspace_join_requests")
      .select("id, user_id, status, requested_at")
      .eq("workspace_id", membership.workspace_id)
      .eq("status", "pending")
      .order("requested_at", { ascending: false })

    if (error) {
      console.error("[join-requests] GET error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const withEmails: Array<{
      id: string
      user_id: string
      email: string
      status: string
      requested_at: string
    }> = []
    for (const r of requests ?? []) {
      try {
        const { data: u } = await supabase.auth.admin.getUserById(r.user_id)
        withEmails.push({
          id: r.id,
          user_id: r.user_id,
          email: u?.user?.email ?? "Unknown",
          status: r.status,
          requested_at: r.requested_at,
        })
      } catch {
        withEmails.push({
          id: r.id,
          user_id: r.user_id,
          email: "Unknown",
          status: r.status,
          requested_at: r.requested_at,
        })
      }
    }

    return NextResponse.json({ requests: withEmails })
  } catch (err) {
    console.error("[join-requests] Error:", err)
    return NextResponse.json({ error: "Failed to load join requests" }, { status: 500 })
  }
}
