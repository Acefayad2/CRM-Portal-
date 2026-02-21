/**
 * PATCH /api/scripts/[id] - update script (or increment usage_count)
 * DELETE /api/scripts/[id] - delete script
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let body: Partial<Script> & { incrementUsage?: boolean }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    if (body.incrementUsage) {
      const { data: current } = await supabase
        .from("scripts")
        .select("usage_count")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()
      if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 })
      const { data: row2, error: err2 } = await supabase
        .from("scripts")
        .update({
          usage_count: (Number(current.usage_count) ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single()
      if (err2) return NextResponse.json({ error: err2.message }, { status: 500 })
      return NextResponse.json({ script: rowToScript(row2!) })
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (body.title !== undefined) updates.title = body.title
    if (body.category !== undefined) updates.category = body.category
    if (body.content !== undefined) updates.content = body.content
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.author !== undefined) updates.author = body.author
    if (body.isTemplate !== undefined) updates.is_template = body.isTemplate
    if (body.usageCount !== undefined) updates.usage_count = body.usageCount

    const { data: row, error } = await supabase
      .from("scripts")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single()

    if (error) {
      console.error("[api/scripts] PATCH error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ script: rowToScript(row) })
  } catch (err) {
    console.error("[api/scripts] Error:", err)
    return NextResponse.json({ error: "Failed to update script" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { error } = await supabase
      .from("scripts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("[api/scripts] DELETE error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/scripts] Error:", err)
    return NextResponse.json({ error: "Failed to delete script" }, { status: 500 })
  }
}
