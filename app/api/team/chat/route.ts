/**
 * GET /api/team/chat - List team messages
 * POST /api/team/chat - Send a team message
 * Body for POST: { message: string }
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

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
      return NextResponse.json({ messages: [] })
    }

    const { data: rows } = await supabase
      .from("team_messages")
      .select("id, user_id, message, created_at")
      .eq("workspace_id", membership.workspace_id)
      .order("created_at", { ascending: true })

    if (!rows?.length) {
      return NextResponse.json({ messages: [] })
    }

    const userIds = [...new Set(rows.map((r) => r.user_id))]
    const emails: Record<string, string> = {}
    for (const uid of userIds) {
      try {
        const { data: u } = await supabase.auth.admin.getUserById(uid)
        emails[uid] = u?.user?.email ?? "Unknown"
      } catch {
        emails[uid] = "Unknown"
      }
    }

    const messages = rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userEmail: emails[r.user_id],
      message: r.message,
      createdAt: r.created_at,
    }))

    return NextResponse.json({ messages })
  } catch (err) {
    console.error("[team/chat] GET Error:", err)
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 })
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

    const membership = await getWorkspaceForUser(user.id)
    if (!membership) {
      return NextResponse.json({ error: "No workspace" }, { status: 400 })
    }

    let body: { message?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const message = body?.message?.trim()
    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("team_messages")
      .insert({
        workspace_id: membership.workspace_id,
        user_id: user.id,
        message,
      })
      .select("id, user_id, message, created_at")
      .single()

    if (error) {
      console.error("[team/chat] POST Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      userId: data.user_id,
      userEmail: user.email,
      message: data.message,
      createdAt: data.created_at,
    })
  } catch (err) {
    console.error("[team/chat] POST Error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
