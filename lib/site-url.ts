import { SITE_ORIGIN } from "@/lib/site"

/**
 * Public absolute URL for invite links and emails.
 * Prefers env, then request Host; falls back to production SITE_ORIGIN (never a bare localhost default).
 */
export function resolvePublicBaseUrl(request: Request): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")

  const host = request.headers.get("host")
  if (host) {
    const isLocal = host.includes("localhost") || host.startsWith("127.")
    const proto =
      request.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https")
    return `${proto}://${host}`.replace(/\/$/, "")
  }

  return SITE_ORIGIN.replace(/\/$/, "")
}
