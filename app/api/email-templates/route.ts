/**
 * GET /api/email-templates - list templates for current workspace (system + overrides)
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { listEmailTemplates, isTemplateName } from "@/lib/email-templates"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    const workspaceId = membership?.workspace_id ?? null
    const templates = await listEmailTemplates(workspaceId)
    return NextResponse.json({ templates })
  } catch (err) {
    console.error("[api/email-templates] GET error:", err)
    return NextResponse.json({ error: "Failed to list templates" }, { status: 500 })
  }
}
