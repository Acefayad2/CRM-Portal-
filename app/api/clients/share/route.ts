/**
 * POST /api/clients/share
 * Share a client contact with a teammate.
 * Body: { client: Client, toUserId: string }
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { Client } from "@/lib/crm-data"

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    if (!membership) {
      return NextResponse.json({ error: "No workspace" }, { status: 400 })
    }

    let body: { client?: Client; toUserId?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { client, toUserId } = body
    if (!client || !toUserId) {
      return NextResponse.json({ error: "client and toUserId required" }, { status: 400 })
    }

    // Ensure the client being shared belongs to the current user (no data leak)
    const { data: ownedClient } = await authClient
      .from("clients")
      .select("id")
      .eq("id", client.id)
      .eq("workspace_id", membership.workspace_id)
      .single()
    if (!ownedClient) {
      return NextResponse.json(
        { error: "Client not found or you can only share your own clients" },
        { status: 403 }
      )
    }

    const { data: isMember } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", membership.workspace_id)
      .eq("user_id", toUserId)
      .single()

    if (!isMember) {
      return NextResponse.json({ error: "Recipient is not in your workspace" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("client_shares")
      .insert({
        workspace_id: membership.workspace_id,
        from_user_id: user.id,
        to_user_id: toUserId,
        client_data: client,
      })
      .select("id, created_at")
      .single()

    if (error) {
      console.error("[clients/share] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id, createdAt: data.created_at })
  } catch (err) {
    console.error("[clients/share] Error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
