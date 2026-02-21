import type { Client } from "@/lib/crm-data"

/**
 * Placeholders supported when sending scripts to clients:
 * - {{firstName}}
 * - {{lastName}}
 * - {{name}} or {{clientName}} (full name)
 */
const PLACEHOLDERS: Array<{ key: RegExp; value: (c: Client) => string }> = [
  { key: /\{\{firstName\}\}/gi, value: (c) => c.firstName ?? "" },
  { key: /\{\{lastName\}\}/gi, value: (c) => c.lastName ?? "" },
  { key: /\{\{name\}\}/gi, value: (c) => [c.firstName, c.lastName].filter(Boolean).join(" ") },
  { key: /\{\{clientName\}\}/gi, value: (c) => [c.firstName, c.lastName].filter(Boolean).join(" ") },
]

export function customizeScriptForClient(scriptContent: string, client: Client): string {
  let out = scriptContent
  for (const { key, value } of PLACEHOLDERS) {
    out = out.replace(key, value(client))
  }
  return out
}
