import { createClient } from "@/lib/supabase/server"
import { hasSupabaseBrowserEnv } from "@/lib/supabase/env"
import { getSafeInternalNextPath } from "@/lib/auth-redirect"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const { searchParams } = url
  const forwardedHost = request.headers.get("x-forwarded-host")
  const origin = forwardedHost
    ? `${request.headers.get("x-forwarded-proto") ?? "https"}://${forwardedHost}`
    : url.origin
  const code = searchParams.get("code")
  let next = getSafeInternalNextPath(searchParams.get("next"), "/portal")

  if (!hasSupabaseBrowserEnv()) {
    return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const user = data.user
      const hasPhone = !!user.user_metadata?.phone
      const isVerified = user.user_metadata?.phone_verified === true

      if (!hasPhone) {
        next = `/complete-profile?next=${encodeURIComponent(next)}`
      } else if (!isVerified) {
        next = `/verify-phone?next=${encodeURIComponent(next)}`
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error("[auth/callback] exchangeCodeForSession error:", error?.message)
  } else {
    console.error("[auth/callback] No code in callback URL")
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
