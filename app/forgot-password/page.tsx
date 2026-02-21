"use client"

import Link from "next/link"
import { useState } from "react"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: Connect to auth (e.g. Supabase resetPasswordForEmail)
      await new Promise((r) => setTimeout(r, 500))
      setSent(true)
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
          <h1 className="mb-6 text-xl font-semibold text-white">Reset password</h1>
          {sent ? (
            <p className="text-sm text-white/80">
              If an account exists for that email, we&apos;ve sent a reset link.
            </p>
          ) : (
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
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white/20 text-white hover:bg-white/30"
              >
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-white/70">
            <Link href="/login" className="font-medium text-white hover:underline">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
