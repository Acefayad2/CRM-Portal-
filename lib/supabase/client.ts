"use client"

import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { getSupabaseSsrCookieOptions } from "@/lib/supabase/ssr-cookie-options"

export function createClient() {
  const env = getSupabaseBrowserEnv()

  if (!env) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  return createBrowserClient(env.url, env.anonKey, {
    cookieOptions: getSupabaseSsrCookieOptions(),
  })
}
