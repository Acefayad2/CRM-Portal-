/**
 * SMS message database logging - optional, requires Supabase.
 * Logs outbound sends and inbound/status updates from Twilio webhook.
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

type MessageDirection = "outbound" | "inbound"
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

interface MessageRow {
  id?: string
  direction: MessageDirection
  status: MessageStatus
  to_phone: string
  from_phone: string
  body: string
  provider_message_id?: string | null
}

export async function insertOutboundMessage(params: {
  to_phone: string
  from_phone: string
  body: string
  provider_message_id?: string | null
  status?: MessageStatus
}): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null
  const { data, error } = await supabase
    .from("messages")
    .insert({
      direction: "outbound",
      status: params.status ?? "queued",
      to_phone: params.to_phone,
      from_phone: params.from_phone,
      body: params.body,
      provider_message_id: params.provider_message_id ?? null,
    } satisfies MessageRow)
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
  if (!isSupabaseConfigured() || !supabase) return
  const { error } = await supabase
    .from("messages")
    .update({ status })
    .eq("provider_message_id", providerMessageId)
  if (error) {
    console.error("[sms-db] updateMessageStatus error:", error)
  }
}

/** Update a message by its DB id (e.g. right after send, to set provider_message_id + status) */
export async function updateMessageById(
  id: string,
  updates: { provider_message_id?: string; status?: MessageStatus }
): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return
  const { error } = await supabase.from("messages").update(updates).eq("id", id)
  if (error) {
    console.error("[sms-db] updateMessageById error:", error)
  }
}

export async function upsertInboundMessage(params: {
  from_phone: string
  to_phone: string
  body: string
  provider_message_id: string
}): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return
  const { error } = await supabase.from("messages").insert({
    direction: "inbound",
    status: "received",
    to_phone: params.to_phone,
    from_phone: params.from_phone,
    body: params.body,
    provider_message_id: params.provider_message_id,
  } satisfies MessageRow)
  if (error) {
    console.error("[sms-db] upsertInboundMessage error:", error)
  }
}
