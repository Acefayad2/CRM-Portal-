import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { getSupabaseSsrCookieOptions } from "@/lib/supabase/ssr-cookie-options"

export async function createClient() {
  const cookieStore = await cookies()
  const env = getSupabaseBrowserEnv()

  if (!env) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  return createServerClient(env.url, env.anonKey, {
    cookieOptions: getSupabaseSsrCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignore in Server Component
        }
      },
    },
  })
}
