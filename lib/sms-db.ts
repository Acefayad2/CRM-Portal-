/**
 * SMS message database logging - optional, requires Supabase.
 * Logs outbound sends and inbound/status updates from Twilio webhook.
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

type MessageStatus = "queued" | "sent" | "delivered" | "failed" | "received"

/** Normalize Twilio status to our schema (queued|sent|delivered|failed) */
export function normalizeTwilioStatus(status: string | null | undefined): MessageStatus {
  if (!status) return "queued"
  const s = status.toLowerCase()
  if (["sending", "queued"].includes(s)) return "queued"
  if (s === "sent") return "sent"
  if (s === "delivered") return "delivered"
  if (["failed", "undelivered"].includes(s)) return "failed"
  return "queued"
}

export async function insertOutboundMessage(params: {
  workspace_id: string
  to_phone: string
  from_phone: string
  body: string
  provider_message_id?: string | null
  status?: MessageStatus
}): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null
  const { data, error } = await supabase
    .from("sms_logs")
    .insert({
      workspace_id: params.workspace_id,
      to_phone: params.to_phone,
      from_phone: params.from_phone,
      body: params.body,
      provider_message_id: params.provider_message_id ?? null,
    })
    .select("id")
    .single()
  if (error) {
    console.error("[sms-db] insertOutboundMessage error:", error)
    return null
  }
  return data?.id ?? null
}

export async function updateMessageStatus(
  providerMessageId: string,
  status: MessageStatus
): Promise<void> {
  void providerMessageId
  void status
  // sms_logs does not currently persist delivery status. Keep this as a safe no-op
  // until the schema adds a dedicated status column for Twilio callbacks.
}

/** Update a message by its DB id (e.g. right after send, to set provider_message_id + status) */
export async function updateMessageById(
  id: string,
  updates: { provider_message_id?: string; status?: MessageStatus }
): Promise<void> {
  void id
  void updates
  // No-op for now. sms_logs records sends/receipts, but does not have a mutable status column.
}

export async function upsertInboundMessage(params: {
  from_phone: string
  to_phone: string
  body: string
  provider_message_id: string
}): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return
  const { data: priorOutbound } = await supabase
    .from("sms_logs")
    .select("workspace_id")
    .eq("to_phone", params.from_phone)
    .eq("from_phone", params.to_phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!priorOutbound?.workspace_id) {
    console.warn("[sms-db] Could not resolve workspace for inbound SMS", {
      from_phone: params.from_phone,
      to_phone: params.to_phone,
      provider_message_id: params.provider_message_id,
    })
    return
  }

  const { error } = await supabase.from("sms_logs").insert({
    workspace_id: priorOutbound.workspace_id,
    to_phone: params.to_phone,
    from_phone: params.from_phone,
    body: params.body,
    provider_message_id: params.provider_message_id,
  })
  if (error) {
    console.error("[sms-db] upsertInboundMessage error:", error)
  }
}
