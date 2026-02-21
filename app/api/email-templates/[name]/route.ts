/**
 * GET /api/email-templates/[name] - get one template
 * PATCH /api/email-templates/[name] - update (upsert workspace override)
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { getEmailTemplate, isTemplateName } from "@/lib/email-templates"
import { supabase } from "@/lib/supabase"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    if (!isTemplateName(name)) {
      return NextResponse.json({ error: "Unknown template name" }, { status: 400 })
    }
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    const template = await getEmailTemplate(name, membership?.workspace_id ?? null)
    if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 })
    return NextResponse.json(template)
  } catch (err) {
    console.error("[api/email-templates/[name]] GET error:", err)
    return NextResponse.json({ error: "Failed to get template" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    if (!isTemplateName(name)) {
      return NextResponse.json({ error: "Unknown template name" }, { status: 400 })
    }
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    const workspaceId = membership?.workspace_id
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace" }, { status: 400 })
    }

    let body: { subject?: string; body_html?: string; body_text?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 })
    }

    const { data: existing } = await supabase
      .from("email_templates")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("name", name)
      .maybeSingle()

    const updates: { subject?: string; body_html?: string; body_text?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    }
    if (body.subject !== undefined) updates.subject = body.subject
    if (body.body_html !== undefined) updates.body_html = body.body_html
    if (body.body_text !== undefined) updates.body_text = body.body_text

    if (existing?.id) {
      const { error } = await supabase
        .from("email_templates")
        .update(updates)
        .eq("id", existing.id)
      if (error) {
        console.error("[api/email-templates/[name]] PATCH update error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      const systemRow = await supabase
        .from("email_templates")
        .select("subject, body_html, body_text")
        .is("workspace_id", null)
        .eq("name", name)
        .single()
      const base = systemRow.data ?? { subject: "", body_html: "", body_text: "" }
      const { error } = await supabase.from("email_templates").insert({
        workspace_id: workspaceId,
        name,
        subject: updates.subject ?? base.subject,
        body_html: updates.body_html ?? base.body_html,
        body_text: updates.body_text ?? base.body_text,
        updated_at: updates.updated_at,
      })
      if (error) {
        console.error("[api/email-templates/[name]] PATCH insert error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    const template = await getEmailTemplate(name, workspaceId)
    return NextResponse.json(template ?? {})
  } catch (err) {
    console.error("[api/email-templates/[name]] PATCH error:", err)
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}
