import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseBrowserEnv, hasSupabaseBrowserEnv } from "@/lib/supabase/env"
import { getSupabaseSsrCookieOptions } from "@/lib/supabase/ssr-cookie-options"
import { getSafeInternalNextPath } from "@/lib/auth-redirect"

export const dynamic = "force-dynamic"

function getRequestOrigin(request: NextRequest): string {
  const url = new URL(request.url)
  const forwardedHost = request.headers.get("x-forwarded-host")
  if (forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https"
    return `${proto}://${forwardedHost}`
  }
  return url.origin
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const origin = getRequestOrigin(request)
  const code = url.searchParams.get("code")
  let next = getSafeInternalNextPath(url.searchParams.get("next"), "/portal")

  if (!hasSupabaseBrowserEnv()) {
    return NextResponse.redirect(new URL("/login?error=supabase_not_configured", origin))
  }

  const env = getSupabaseBrowserEnv()!

  if (!code) {
    console.error("[auth/callback] No code in callback URL")
    return NextResponse.redirect(new URL("/login?error=auth_callback_error", origin))
  }

  // Route handlers cannot persist Supabase session cookies via `cookies()` from next/headers
  // (cookieStore.set throws). Use a mutable NextResponse like middleware — same @supabase/ssr pattern.
  const cookieResponse = NextResponse.next()

  const supabase = createServerClient(env.url, env.anonKey, {
    cookieOptions: getSupabaseSsrCookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error("[auth/callback] exchangeCodeForSession error:", error?.message)
    return NextResponse.redirect(new URL("/login?error=auth_callback_error", origin))
  }

  const user = data.user
  const hasPhone = !!user.user_metadata?.phone
  const isVerified = user.user_metadata?.phone_verified === true

  if (!hasPhone) {
    next = `/complete-profile?next=${encodeURIComponent(next)}`
  } else if (!isVerified) {
    next = `/verify-phone?next=${encodeURIComponent(next)}`
  }

  const redirect = NextResponse.redirect(new URL(next, origin))
  const setCookies = cookieResponse.headers.getSetCookie()
  for (const c of setCookies) {
    redirect.headers.append("Set-Cookie", c)
  }
  return redirect
}
