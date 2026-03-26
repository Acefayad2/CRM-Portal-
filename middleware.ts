import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseBrowserEnv } from "@/lib/supabase/env"

const PROTECTED_PATHS = ["/portal", "/join-team"]
const ALLOW_UNVERIFIED = ["/verify-phone", "/complete-profile", "/login", "/signup", "/forgot-password", "/join-invite"]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  if (process.env.NODE_ENV !== "production") {
    return response
  }

  const env = getSupabaseBrowserEnv()
  if (!env) {
    return response
  }

  const supabase = createServerClient(env.url, env.anonKey, {
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

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/api/")) {
    return response
  }

  if (user) {
    const hasPhone = !!user.user_metadata?.phone
    const isVerified = user.user_metadata?.phone_verified === true
    const needsVerification =
      hasPhone &&
      !isVerified &&
      PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
    const canAccessUnverified = ALLOW_UNVERIFIED.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    )

    if (needsVerification && !canAccessUnverified) {
      return NextResponse.redirect(new URL("/verify-phone", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
