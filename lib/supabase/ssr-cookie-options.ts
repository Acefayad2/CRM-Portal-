import type { CookieOptionsWithName } from "@supabase/ssr"

/** Shared cookie flags for @supabase/ssr (middleware, server, browser). */
export function getSupabaseSsrCookieOptions(): CookieOptionsWithName {
  return {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  }
}
