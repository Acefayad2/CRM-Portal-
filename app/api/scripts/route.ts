/**
 * GET /api/scripts - list current user's scripts (Supabase)
 * POST /api/scripts - create a script
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Script } from "@/lib/scripts-data"

function rowToScript(row: Record<string, unknown>): Script {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    category: (row.category as Script["category"]) ?? "presentation",
    content: String(row.content ?? ""),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    createdAt: new Date((row.created_at as string) ?? 0).toISOString(),
    updatedAt: new Date((row.updated_at as string) ?? 0).toISOString(),
    author: String(row.author ?? "You"),
    isTemplate: Boolean(row.is_template),
    usageCount: Number(row.usage_count) ?? 0,
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    if (!membership) return NextResponse.json({ scripts: [] }) // no workspace = empty list

    const { data: rows, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("workspace_id", membership.workspace_id)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("[api/scripts] GET error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const scripts = (rows ?? []).map(rowToScript)
    return NextResponse.json({ scripts })
  } catch (err) {
    console.error("[api/scripts] Error:", err)
    return NextResponse.json({ error: "Failed to load scripts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 400 })

    let body: Partial<Script>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { data: row, error } = await supabase
      .from("scripts")
      .insert({
        workspace_id: membership.workspace_id,
        user_id: user.id,
        title: body.title ?? "",
        category: body.category ?? "presentation",
        content: body.content ?? "",
        tags: body.tags ?? [],
        author: body.author ?? "You",
        is_template: body.isTemplate ?? false,
        usage_count: body.usageCount ?? 0,
      })
      .select("*")
      .single()

    if (error) {
      console.error("[api/scripts] POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ script: rowToScript(row) })
  } catch (err) {
    console.error("[api/scripts] Error:", err)
    return NextResponse.json({ error: "Failed to create script" }, { status: 500 })
  }
}
