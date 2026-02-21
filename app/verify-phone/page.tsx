"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"

export default function VerifyPhonePage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setChecking(false)
      if (!user) {
        router.replace("/login?next=/verify-phone")
        return
      }
      if (user.user_metadata?.phone_verified === true) {
        router.replace("/join-team?new=1")
      }
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (code.length !== 6) {
      setError("Please enter the 6-digit code.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Verification failed. Please try again.")
        return
      }
      router.push("/join-team?new=1")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError("")
    setSuccess("")
    setResendLoading(true)
    try {
      const res = await fetch("/api/auth/resend-verification-code", {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to resend. Please try again.")
        return
      }
      setCode("")
      setSuccess("A new code has been sent to your phone.")
    } catch (err) {
      setError("Failed to resend. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  if (checking) {
    return (
      <AuthLayout>
        <div className="flex w-full max-w-md items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      </AuthLayout>
    )
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
          <h1 className="mb-2 text-xl font-semibold text-white">
            Verify your phone
          </h1>
          <p className="mb-6 text-sm text-white/70">
            Enter the 6-digit code we sent to your phone to continue.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                containerClassName="justify-center"
              >
                <InputOTPGroup
                  className={cn(
                    "gap-2 rounded-lg border border-white/30 bg-white/10 p-2",
                    "focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/30"
                  )}
                >
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="border-white/20 bg-white/5 text-white"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-center text-sm text-red-400">{error}</p>}
            {success && <p className="text-center text-sm text-green-400">{success}</p>}
            <Button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-white/20 text-white hover:bg-white/30"
            >
              {loading ? "Verifying..." : "Verify & continue"}
            </Button>
            <p className="text-center text-sm text-white/60">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="font-medium text-white hover:underline disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend code"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
