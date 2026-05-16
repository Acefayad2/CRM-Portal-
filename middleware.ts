import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"
import { getSupabaseSsrCookieOptions } from "@/lib/supabase/ssr-cookie-options"
import { SMS_VERIFICATION_ENABLED } from "@/lib/sms-verification"

const PROTECTED_PATHS = ["/portal", "/join-team", "/admin"]
const ALLOW_UNVERIFIED = ["/verify-phone", "/complete-profile", "/login", "/signup", "/forgot-password", "/join-invite"]

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const pathname = request.nextUrl.pathname

  const env = getSupabaseBrowserEnv()
  if (!env) {
    return NextResponse.redirect(
      new URL("/login?error=supabase_not_configured", request.url)
    )
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookieOptions: getSupabaseSsrCookieOptions(),
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const login = new URL("/login", request.url)
    login.searchParams.set("next", `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(login)
  }

  const hasPhone = !!user.user_metadata?.phone
  const isVerified = user.user_metadata?.phone_verified === true
  const needsVerification =
    SMS_VERIFICATION_ENABLED &&
    hasPhone &&
    !isVerified &&
    isProtectedPath(pathname)
  const canAccessUnverified = ALLOW_UNVERIFIED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  if (needsVerification && !canAccessUnverified) {
    return NextResponse.redirect(new URL("/verify-phone", request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Only routes that need auth checks or session refresh.
     * Avoids a Supabase getUser() round-trip on every marketing/legal/static hit.
     */
    "/portal",
    "/portal/:path*",
    "/join-team",
    "/join-team/:path*",
    "/admin",
    "/admin/:path*",
  ],
}
