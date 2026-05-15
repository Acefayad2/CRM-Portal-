/**
 * Same-origin path (and optional query) for post-login redirects. Rejects open redirects.
 */
export function getSafeInternalNextPath(
  value: string | null | undefined,
  fallback: string
): string {
  if (value == null || value === "") return fallback
  const t = value.trim()
  if (!t.startsWith("/") || t.startsWith("//")) return fallback
  if (t.includes("://") || t.includes("\\")) return fallback
  if (t.includes("\n") || t.includes("\r")) return fallback
  return t
}
