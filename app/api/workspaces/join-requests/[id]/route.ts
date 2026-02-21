/**
 * POST /api/workspaces/join-requests/[id]
 * Body: { action: "accept" | "reject" }
 * Admin only. Accept: add user to workspace_members and update request. Reject: update request only.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getWorkspaceForUser } from "@/lib/workspace"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    const { id: requestId } = await params
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 400 })
    if (membership.role !== "admin") {
      return NextResponse.json({ error: "Only admins can accept or reject requests" }, { status: 403 })
    }

    let body: { action?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const action = body?.action === "accept" ? "accept" : body?.action === "reject" ? "reject" : null
    if (!action) {
      return NextResponse.json({ error: "action must be 'accept' or 'reject'" }, { status: 400 })
    }

    const { data: joinRequest, error: fetchError } = await supabase
      .from("workspace_join_requests")
      .select("id, workspace_id, user_id, status")
      .eq("id", requestId)
      .eq("workspace_id", membership.workspace_id)
      .single()

    if (fetchError || !joinRequest) {
      return NextResponse.json({ error: "Join request not found" }, { status: 404 })
    }
    if (joinRequest.status !== "pending") {
      return NextResponse.json({ error: "Request already handled" }, { status: 400 })
    }

    const now = new Date().toISOString()

    if (action === "accept") {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan_id")
        .eq("workspace_id", membership.workspace_id)
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
        .eq("workspace_id", membership.workspace_id)
      if ((plan?.max_members ?? 0) <= (count ?? 0)) {
        return NextResponse.json({ error: "Workspace has reached maximum members" }, { status: 400 })
      }

      const { error: insertError } = await supabase.from("workspace_members").insert({
        workspace_id: membership.workspace_id,
        user_id: joinRequest.user_id,
        role: "member",
      })
      if (insertError) {
        console.error("[join-requests] insert member error:", insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    const { error: updateError } = await supabase
      .from("workspace_join_requests")
      .update({
        status: action === "accept" ? "accepted" : "rejected",
        responded_at: now,
        responded_by: user.id,
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("[join-requests] update error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action,
    })
  } catch (err) {
    console.error("[join-requests] Error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
