/**
 * Email sending via Resend.
 * Set RESEND_API_KEY and EMAIL_FROM (e.g. noreply@yourdomain.com or onboarding@resend.dev for testing).
 */
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const DEFAULT_FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev"

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

export type SendEmailOptions = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!resend) {
    return { ok: false, error: "Email (Resend) is not configured" }
  }
  const to = Array.isArray(options.to) ? options.to : [options.to]
  const from = options.from ?? DEFAULT_FROM
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: options.subject,
      html: options.html ?? options.text ?? undefined,
      text: options.text,
    })
    if (error) {
      return { ok: false, error: error.message }
    }
    return { ok: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email"
    return { ok: false, error: message }
  }
}
