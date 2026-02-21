/**
 * GET /api/clients/shared-with-me
 * Returns clients shared with the current user.
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { Client } from "@/lib/crm-data"

export interface SharedClient {
  id: string
  client: Client
  fromEmail: string
  createdAt: string
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
      return NextResponse.json({ shared: [] })
    }

    const { data: shares } = await supabase
      .from("client_shares")
      .select("id, from_user_id, client_data, created_at")
      .eq("to_user_id", user.id)
      .eq("workspace_id", membership.workspace_id)
      .order("created_at", { ascending: false })

    if (!shares?.length) {
      return NextResponse.json({ shared: [] })
    }

    const fromIds = [...new Set(shares.map((s) => s.from_user_id))]
    const emails: Record<string, string> = {}
    for (const uid of fromIds) {
      try {
        const { data: u } = await supabase.auth.admin.getUserById(uid)
        emails[uid] = u?.user?.email ?? "Teammate"
      } catch {
        emails[uid] = "Teammate"
      }
    }

    const shared: SharedClient[] = shares.map((s) => ({
      id: s.id,
      client: s.client_data as Client,
      fromEmail: emails[s.from_user_id] ?? "Teammate",
      createdAt: s.created_at,
    }))

    return NextResponse.json({ shared })
  } catch (err) {
    console.error("[clients/shared-with-me] Error:", err)
    return NextResponse.json({ error: "Failed to load shared clients" }, { status: 500 })
  }
}
