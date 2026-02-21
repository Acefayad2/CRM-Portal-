"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/components/auth-layout"
import { BirthdayDatePicker } from "@/components/birthday-date-picker"
import { PhoneInputWithCountry } from "@/components/phone-input-with-country"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CompleteProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<{
    name: string
    email: string
  } | null>(null)
  const [phone, setPhone] = useState("")
  const [birthday, setBirthday] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setChecking(false)
      if (!user) {
        router.replace("/login?next=/complete-profile")
        return
      }
      if (user.user_metadata?.phone && user.user_metadata?.phone_verified) {
        router.replace("/join-team?new=1")
        return
      }
      const name =
        user.user_metadata?.full_name ||
        [user.user_metadata?.given_name, user.user_metadata?.family_name]
          .filter(Boolean)
          .join(" ") ||
        user.user_metadata?.name ||
        ""
      setProfile({
        name,
        email: user.email ?? "",
      })
      if (user.user_metadata?.birthday) {
        setBirthday(user.user_metadata.birthday)
      }
    })
  }, [router])

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
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), birthday }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to save. Please try again.")
        return
      }
      router.push("/verify-phone")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
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

  if (!profile) {
    return null
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
            Complete your profile
          </h1>
          <p className="mb-6 text-sm text-white/70">
            We got your name and email from Google. Add your phone and birthday to continue.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/90">First name</Label>
                <Input
                  value={profile.name.split(" ")[0] ?? ""}
                  readOnly
                  className="border-white/30 bg-white/5 text-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/90">Last name</Label>
                <Input
                  value={profile.name.split(" ").slice(1).join(" ") || "—"}
                  readOnly
                  className="border-white/30 bg-white/5 text-white/80"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/90">Email</Label>
              <Input
                type="email"
                value={profile.email}
                readOnly
                className="border-white/30 bg-white/5 text-white/80"
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
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white/20 text-white hover:bg-white/30"
            >
              {loading ? "Sending code..." : "Continue"}
            </Button>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
