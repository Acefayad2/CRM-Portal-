/**
 * POST /api/workspaces/join
 *
 * Request to join a workspace using team_code. Creates a pending join request;
 * the team admin must accept before the user is added. Returns pending: true.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Service not configured" }, { status: 503 })
    }

    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: { teamCode?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const teamCode = body?.teamCode?.trim()
    if (!teamCode) {
      return NextResponse.json({ error: "Team code is required" }, { status: 400 })
    }

    const { data, error } = await supabase.rpc("request_to_join_workspace", {
      p_team_code: teamCode,
      p_user_id: user.id,
    })

    if (error) {
      console.error("[workspaces/join] RPC error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = data as { success: boolean; error?: string; pending?: boolean }
    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Failed to request" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      workspace_id: result.workspace_id,
      pending: result.pending === true,
    })
  } catch (err) {
    console.error("[workspaces/join] Error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
