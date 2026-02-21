import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const { searchParams } = url
  const forwardedHost = request.headers.get("x-forwarded-host")
  const origin = forwardedHost
    ? `${request.headers.get("x-forwarded-proto") ?? "https"}://${forwardedHost}`
    : url.origin
  const code = searchParams.get("code")
  let next = searchParams.get("next") ?? "/portal"

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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
        next = "/complete-profile"
      } else if (!isVerified) {
        next = "/verify-phone"
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error("[auth/callback] exchangeCodeForSession error:", error?.message)
  } else {
    console.error("[auth/callback] No code in callback URL")
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
