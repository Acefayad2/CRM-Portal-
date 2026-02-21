"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

function JoinInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "joined">("loading")
  const [workspaceName, setWorkspaceName] = useState("")
  const [error, setError] = useState("")
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus("invalid")
      setError("Invalid link. Missing token.")
      return
    }
    fetch(`/api/workspaces/join-invite?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setStatus("valid")
          setWorkspaceName(data.workspaceName ?? "the team")
        } else {
          setStatus("invalid")
          setError(data.error ?? "Invalid or expired link")
        }
      })
      .catch(() => {
        setStatus("invalid")
        setError("Could not verify invite")
      })
  }, [token])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u ?? null))
  }, [])

  const handleJoin = async () => {
    if (!token || joining) return
    setJoining(true)
    setError("")
    try {
      const res = await fetch("/api/workspaces/join-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to join")
        setJoining(false)
        return
      }
      setStatus("joined")
      router.push("/portal")
    } catch {
      setError("Something went wrong")
      setJoining(false)
    }
  }

  const nextUrl = `/join-invite?token=${encodeURIComponent(token)}`

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8 text-center">
            <Link href="/" className="text-2xl font-bold text-white">
              Pantheon
            </Link>
            <p className="mt-2 text-sm text-white/80">Protect Today. Grow Tomorrow.</p>
          </div>

          {status === "loading" && (
            <div className="py-8 text-center text-white/80">Verifying invite...</div>
          )}

          {status === "invalid" && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-white">Invalid link</h1>
              <p className="mb-6 text-sm text-white/70">{error}</p>
              <Button asChild className="w-full bg-white/20 text-white hover:bg-white/30">
                <Link href="/login">Go to login</Link>
              </Button>
            </>
          )}

          {status === "valid" && !user && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-white">You&apos;re invited</h1>
              <p className="mb-6 text-sm text-white/70">
                Sign up or log in to join <strong>{workspaceName}</strong>. The link will bring you back here to complete joining.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full bg-white/20 text-white hover:bg-white/30">
                  <Link href={`/login?next=${encodeURIComponent(nextUrl)}`}>Log in</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
                  <Link href={`/signup?next=${encodeURIComponent(nextUrl)}`}>Sign up</Link>
                </Button>
              </div>
            </>
          )}

          {status === "valid" && user && (
            <>
              <h1 className="mb-2 text-xl font-semibold text-white">Join {workspaceName}</h1>
              <p className="mb-6 text-sm text-white/70">
                You&apos;re logged in. Click below to join the team.
              </p>
              {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
              <Button
                onClick={handleJoin}
                disabled={joining}
                className="w-full bg-white/20 text-white hover:bg-white/30"
              >
                {joining ? "Joining..." : "Join team"}
              </Button>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  )
}

export default function JoinInvitePage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="flex h-full w-full max-w-md items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        </AuthLayout>
      }
    >
      <JoinInviteContent />
    </Suspense>
  )
}
