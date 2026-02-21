/**
 * Load email templates from DB (system or workspace override) and render with variables.
 * Placeholders: {{name}} and {{#name}}...{{/name}} (conditional block).
 */
import { supabase } from "@/lib/supabase"

export type EmailTemplateRow = {
  id: string
  workspace_id: string | null
  name: string
  subject: string
  body_html: string
  body_text: string
}

const TEMPLATE_NAMES = [
  "appointment_reminder",
  "booking_confirmation",
  "time_slot_request",
  "workspace_invite",
] as const
export type EmailTemplateName = (typeof TEMPLATE_NAMES)[number]

export function isTemplateName(name: string): name is EmailTemplateName {
  return TEMPLATE_NAMES.includes(name as EmailTemplateName)
}

/**
 * Get template: workspace override first, then system (workspace_id null).
 */
export async function getEmailTemplate(
  name: EmailTemplateName,
  workspaceId: string | null
): Promise<EmailTemplateRow | null> {
  if (!supabase) return null
  if (workspaceId) {
    const { data } = await supabase
      .from("email_templates")
      .select("id, workspace_id, name, subject, body_html, body_text")
      .eq("workspace_id", workspaceId)
      .eq("name", name)
      .maybeSingle()
    if (data) return data as EmailTemplateRow
  }
  const { data } = await supabase
    .from("email_templates")
    .select("id, workspace_id, name, subject, body_html, body_text")
    .is("workspace_id", null)
    .eq("name", name)
    .maybeSingle()
  return (data as EmailTemplateRow) ?? null
}

/**
 * Replace {{key}} with value; {{#key}}...{{/key}} with content if value truthy, else "".
 */
export function renderTemplate(
  subject: string,
  bodyHtml: string,
  bodyText: string,
  vars: Record<string, string | undefined>
): { subject: string; html: string; text: string } {
  const sub = (s: string) => substituteVars(s, vars)
  return {
    subject: sub(subject),
    html: sub(bodyHtml),
    text: sub(bodyText),
  }
}

function substituteVars(s: string, vars: Record<string, string | undefined>): string {
  let out = s
  // Conditional blocks {{#key}}...{{/key}}
  const blockRe = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g
  out = out.replace(blockRe, (_, key, content) => {
    const v = vars[key]
    return v && v.trim() ? substituteVars(content, vars) : ""
  })
  // Simple {{key}}
  for (const [key, value] of Object.entries(vars)) {
    const re = new RegExp(`\\{\\{${key}\\}\\}`, "g")
    out = out.replace(re, value ?? "")
  }
  return out
}

/**
 * List templates for a workspace (system defaults + workspace overrides).
 */
export async function listEmailTemplates(workspaceId: string | null): Promise<EmailTemplateRow[]> {
  if (!supabase) return []
  const { data: system } = await supabase
    .from("email_templates")
    .select("id, workspace_id, name, subject, body_html, body_text")
    .is("workspace_id", null)
    .in("name", [...TEMPLATE_NAMES])
    .order("name")
  const systemRows = (system ?? []) as EmailTemplateRow[]
  if (!workspaceId) return systemRows
  const { data: overrides } = await supabase
    .from("email_templates")
    .select("id, workspace_id, name, subject, body_html, body_text")
    .eq("workspace_id", workspaceId)
    .in("name", [...TEMPLATE_NAMES])
  const overrideRows = (overrides ?? []) as EmailTemplateRow[]
  const byName = new Map(overrideRows.map((r) => [r.name, r]))
  return systemRows.map((row) => (byName.get(row.name) ?? row))
}
