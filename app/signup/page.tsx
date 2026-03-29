"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { AuthDivider } from "@/components/auth/auth-divider"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { AuthLayout } from "@/components/auth-layout"
import { BirthdayDatePicker } from "@/components/birthday-date-picker"
import { PhoneInputWithCountry } from "@/components/phone-input-with-country"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAuthErrorMessage } from "@/lib/auth-errors"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [birthday, setBirthday] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const displayError = error || getAuthErrorMessage(errorParam)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!birthday) {
      setError("Please select your birthday")
      return
    }
    const phoneDigits = phone.replace(/\D/g, "")
    if (!phone || phoneDigits.length < 10) {
      setError("Please enter a valid phone number")
      return
    }
    setLoading(true)
    try {
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ")
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: fullName,
          phone: phone.trim(),
          birthday: birthday || undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Signup failed. Please try again.")
        return
      }

      const nextPath = typeof data?.nextPath === "string" ? data.nextPath : "/verify-phone"
      router.push(nextPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed")
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
          <h1 className="mb-6 text-xl font-semibold text-white">Create an account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white/90">
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="border-white/30 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white/90">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Smith"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="border-white/30 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                />
              </div>
            </div>
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
              <Label htmlFor="phone" className="text-white/90">
                Phone number
              </Label>
              <PhoneInputWithCountry
                value={phone}
                onChange={setPhone}
                placeholder="555 123 4567"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthday" className="text-white/90">
                Birthday
              </Label>
              <BirthdayDatePicker
                value={birthday}
                onChange={setBirthday}
                placeholder="Pick your birthday"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="border-white/30 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"
              />
              <p className="text-xs text-white/60">At least 8 characters</p>
            </div>
            {displayError && (
              <p className="text-sm text-red-400">{displayError}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white/20 text-white hover:bg-white/30"
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
            <AuthDivider />
            <GoogleSignInButton variant="signup" redirectTo="/join-team?new=1" />
          </form>
          <p className="mt-6 text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}

function SignupFallback() {
  return (
    <AuthLayout>
      <div className="flex items-center justify-center w-full max-w-md">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    </AuthLayout>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupForm />
    </Suspense>
  )
}
