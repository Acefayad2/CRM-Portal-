/**
 * GET /api/workspaces/join-invite?token=xxx
 * Returns whether the token is valid and workspace name (for display). No auth required.
 *
 * POST /api/workspaces/join-invite
 * Body: { token: string }
 * User must be authenticated. Consumes the token and adds user to the workspace.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getWorkspaceForUser } from "@/lib/workspace"

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ valid: false, error: "Not configured" }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")?.trim()
    if (!token) {
      return NextResponse.json({ valid: false, error: "Token required" }, { status: 400 })
    }

    const { data: invite, error } = await supabase
      .from("workspace_invites")
      .select("id, workspace_id, expires_at, used_at")
      .eq("token", token)
      .single()

    if (error || !invite) {
      return NextResponse.json({ valid: false, error: "Invalid or expired link" })
    }
    if (invite.used_at) {
      return NextResponse.json({ valid: false, error: "This invite has already been used" })
    }
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: "This invite has expired" })
    }

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", invite.workspace_id)
      .single()

    return NextResponse.json({
      valid: true,
      workspaceName: workspace?.name ?? "Team",
    })
  } catch (err) {
    console.error("[join-invite] GET Error:", err)
    return NextResponse.json({ valid: false, error: "Something went wrong" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let body: { token?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const token = body?.token?.trim()
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 })

    const { data: invite, error: fetchError } = await supabase
      .from("workspace_invites")
      .select("id, workspace_id, expires_at, used_at")
      .eq("token", token)
      .single()

    if (fetchError || !invite) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 })
    }
    if (invite.used_at) {
      return NextResponse.json({ error: "This invite has already been used" }, { status: 400 })
    }
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "This invite has expired" }, { status: 400 })
    }

    const alreadyMember = await getWorkspaceForUser(user.id)
    if (alreadyMember?.workspace_id === invite.workspace_id) {
      await supabase
        .from("workspace_invites")
        .update({ used_at: new Date().toISOString(), used_by: user.id })
        .eq("id", invite.id)
      return NextResponse.json({ success: true, alreadyMember: true })
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .eq("workspace_id", invite.workspace_id)
      .eq("status", "active")
      .single()
    if (!sub?.plan_id) {
      return NextResponse.json({ error: "Workspace has no active subscription" }, { status: 400 })
    }
    const { data: plan } = await supabase
      .from("plans")
      .select("max_members")
      .eq("id", sub.plan_id)
      .single()
    const { count } = await supabase
      .from("workspace_members")
      .select("user_id", { count: "exact", head: true })
      .eq("workspace_id", invite.workspace_id)
    if ((plan?.max_members ?? 0) <= (count ?? 0)) {
      return NextResponse.json({ error: "Workspace has reached maximum members" }, { status: 400 })
    }

    const { error: insertError } = await supabase.from("workspace_members").insert({
      workspace_id: invite.workspace_id,
      user_id: user.id,
      role: "member",
    })
    if (insertError) {
      console.error("[join-invite] insert member error:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    await supabase
      .from("workspace_invites")
      .update({ used_at: new Date().toISOString(), used_by: user.id })
      .eq("id", invite.id)

    return NextResponse.json({ success: true, workspace_id: invite.workspace_id })
  } catch (err) {
    console.error("[join-invite] POST Error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
