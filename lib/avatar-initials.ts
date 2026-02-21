/**
 * Get 1–2 letter initials for avatar fallback: first + last name initials, or first only, or email initial, or "U".
 */
export function getUserInitials(firstName?: string | null, lastName?: string | null, email?: string | null): string {
  const first = (firstName ?? "").trim()
  const last = (lastName ?? "").trim()
  if (first || last) {
    const initials = (first[0] ?? "") + (last[0] ?? "")
    return initials.toUpperCase().slice(0, 2) || "U"
  }
  const e = (email ?? "").trim()
  if (e) return e[0].toUpperCase()
  return "U"
}
