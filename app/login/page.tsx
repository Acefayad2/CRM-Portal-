"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthDivider } from "@/components/auth/auth-divider"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAuthErrorMessage } from "@/lib/auth-errors"

export default function LoginPage() {
  const router = useRouter()
  const [errorParam, setErrorParam] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setErrorParam(new URLSearchParams(window.location.search).get("error"))
    }
  }, [])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const displayError = error || getAuthErrorMessage(errorParam)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) throw signInError
      const next = new URLSearchParams(window.location.search).get("next") || "/portal"
      router.push(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8 text-center">
            <Link href="/" className="text-2xl font-bold text-white">
              Pantheon
            </Link>
            <p className="mt-2 text-sm text-white/80">
              Protect Today. Grow Tomorrow.
            </p>
          </div>
          <h1 className="mb-6 text-xl font-semibold text-white">Sign in</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-white/30 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/90">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-white/70 hover:text-white"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-white/30 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
              />
            </div>
            {displayError && (
              <p className="text-sm text-red-400">{displayError}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white/20 text-white hover:bg-white/30"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <AuthDivider />
            <GoogleSignInButton variant="signin" redirectTo="/portal" />
          </form>
          <p className="mt-6 text-center text-sm text-white/70">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-white hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
