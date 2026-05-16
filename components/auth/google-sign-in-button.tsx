"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { GoogleIcon } from "@/components/google-icon"
import { createClient } from "@/lib/supabase/client"
import { getSafeInternalNextPath } from "@/lib/auth-redirect"
import { getAuthErrorMessage } from "@/lib/auth-errors"
import { hasSupabaseBrowserEnv } from "@/lib/supabase/env"

interface GoogleSignInButtonProps {
  variant?: "signin" | "signup"
  redirectTo?: string
}

export function GoogleSignInButton({ variant = "signin", redirectTo }: GoogleSignInButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    if (!hasSupabaseBrowserEnv()) {
      router.push("/login?error=supabase_not_configured")
      return
    }
    setLoading(true)
    try {
      const next = getSafeInternalNextPath(redirectTo, "/portal")
      const origin = window.location.origin
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
          queryParams: {
            prompt: "select_account",
          },
          scopes: "email profile openid",
        },
      })
      if (error) {
        router.push(`/login?error=${encodeURIComponent(error.message)}`)
        return
      }
      if (data.url) {
        window.location.assign(data.url)
        return
      }
      router.push("/login?error=oauth_failed")
    } catch (err) {
      const message = err instanceof Error ? err.message : "oauth_failed"
      router.push(`/login?error=${encodeURIComponent(message)}`)
    } finally {
      setLoading(false)
    }
  }

  const label = loading ? "Redirecting…" : "Continue with Google"

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading || !hasSupabaseBrowserEnv()}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-60"
      aria-label={
        variant === "signup"
          ? "Sign up with your Google account"
          : "Sign in with your Google account"
      }
    >
      <GoogleIcon className="h-5 w-5" />
      {label}
    </button>
  )
}
