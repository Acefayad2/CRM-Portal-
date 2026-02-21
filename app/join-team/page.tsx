"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function JoinTeamForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewUser = searchParams.get("new") === "1"
  const [teamCode, setTeamCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setPending(false)
    setLoading(true)
    try {
      const res = await fetch("/api/workspaces/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamCode: teamCode.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Invalid team code. Please try again.")
        return
      }
      if (data.pending) {
        setPending(true)
        return
      }
      router.push("/portal?show_subscription=1")
    } catch (err) {
      setError("Something went wrong. Please try again.")
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
          <h1 className="mb-2 text-xl font-semibold text-white">
            {isNewUser ? "Welcome! Join your team" : "Join a team"}
          </h1>
          <p className="mb-6 text-sm text-white/70">
            {isNewUser
              ? "Enter the team code your admin shared with you to join their team."
              : "Enter your team code to join an existing team."}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamCode" className="text-white/90">
                Team code
              </Label>
              <Input
                id="teamCode"
                type="text"
                placeholder="e.g. ABC-1234"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                className="border-white/30 bg-white/10 font-mono text-white placeholder:text-white/50 focus-visible:ring-white/30 uppercase placeholder:normal-case"
                maxLength={20}
              />
              <p className="text-xs text-white/60">
                Get this from your team admin who purchased a subscription.
              </p>
            </div>
            {pending && (
              <p className="text-sm text-green-400">
                Request sent! The team admin will review and approve your request. You can close this page and check back later.
              </p>
            )}
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading || !teamCode.trim() || pending}
              className="w-full bg-white/20 text-white hover:bg-white/30"
            >
              {loading ? "Joining..." : "Join team"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-white/70">
            Don&apos;t have a team code?{" "}
            <Link
              href="/portal?show_subscription=1"
              className="font-medium text-white hover:underline"
            >
              Skip for now
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}

export default function JoinTeamPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="flex items-center justify-center w-full max-w-md">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        </AuthLayout>
      }
    >
      <JoinTeamForm />
    </Suspense>
  )
}
