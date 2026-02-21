/**
 * POST /api/workspaces/create
 *
 * Create a new workspace (admin). Generates unique team_code.
 * Body: { name: string }
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

function generateTeamCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(request: Request) {
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

    const existing = await supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).limit(1).single()
    if (existing.data) {
      return NextResponse.json({ error: "You already belong to a workspace" }, { status: 400 })
    }

    let body: { name?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }
    const name = body?.name?.trim() || "My Workspace"

    let teamCode = generateTeamCode()
    for (let i = 0; i < 10; i++) {
      const { data: existingCode } = await supabase.from("workspaces").select("id").eq("team_code", teamCode).single()
      if (!existingCode) break
      teamCode = generateTeamCode()
    }

    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .insert({ name, team_code: teamCode, owner_id: user.id })
      .select("id, name, team_code")
      .single()

    if (wsError) {
      console.error("[workspaces/create] Error:", wsError)
      return NextResponse.json({ error: wsError.message }, { status: 500 })
    }

    await supabase.from("workspace_members").insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "admin",
    })

    return NextResponse.json({ workspace })
  } catch (err) {
    console.error("[workspaces/create] Error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
