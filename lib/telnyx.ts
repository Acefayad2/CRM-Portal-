/**
 * Shared Telnyx SMS sender utility.
 * Used by all API routes that send SMS.
 */

export interface TelnyxSendParams {
  to: string
  body: string
  webhookUrl?: string
}

export interface TelnyxSendResult {
  ok: boolean
  messageId?: string
  error?: string
}

export async function sendTelnyxSms(params: TelnyxSendParams): Promise<TelnyxSendResult> {
  const apiKey = process.env.TELNYX_API_KEY
  const fromNumber = process.env.TELNYX_PHONE_NUMBER
  const messagingProfileId = process.env.TELNYX_MESSAGING_PROFILE_ID

  if (!apiKey) {
    return { ok: false, error: "TELNYX_API_KEY is not configured" }
  }
  if (!fromNumber) {
    return { ok: false, error: "TELNYX_PHONE_NUMBER is not configured" }
  }

  try {
    const payload: Record<string, unknown> = {
      from: fromNumber,
      to: params.to,
      text: params.body,
      webhook_url: params.webhookUrl ?? process.env.TELNYX_WEBHOOK_URL,
    }
    if (messagingProfileId) {
      payload.messaging_profile_id = messagingProfileId
    }

    const res = await fetch("https://api.telnyx.com/v2/messages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      const errMsg = data?.errors?.[0]?.detail ?? data?.errors?.[0]?.title ?? "Telnyx API error"
      return { ok: false, error: errMsg }
    }

    return { ok: true, messageId: data?.data?.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}
