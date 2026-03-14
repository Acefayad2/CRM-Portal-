"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PortalLayout } from "@/components/portal-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Video, Calendar, Copy } from "lucide-react"

type Meeting = {
  id: string
  title: string
  status: string
  starts_at: string | null
  ends_at: string | null
  created_at: string
  deck_id: string | null
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadInfo, setLoadInfo] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/meetings")
      .then(async (r) => {
        if (r.ok) return r.json()
        const data = await r.json().catch(() => ({}))
        if (r.status === 401) {
          setLoadInfo("Sign in to view and host presentations.")
          setLoadError(null)
          return { meetings: [] }
        }
        setLoadInfo(null)
        setLoadError(typeof data.error === "string" ? data.error : "Failed to load presentations.")
        return { meetings: [] }
      })
      .then((data) => {
        setMeetings(Array.isArray(data.meetings) ? data.meetings : [])
      })
      .catch(() => {
        setMeetings([])
        setLoadInfo(null)
        setLoadError("Network error while loading presentations.")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    setCreateError(null)
    setCreateLoading(true)
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Presentation" }),
      })
      const data = await res.json()
      if (res.ok && data.meeting) {
        window.location.href = `/portal/meetings/${data.meeting.id}`
        return
      }
      setCreateError(data?.error ?? "Failed to create presentation")
    } catch (_e) {
      setCreateError("Network error. Please try again.")
    } finally {
      setCreateLoading(false)
    }
  }

  const statusColor = (status: string) => {
    if (status === "live") return "text-green-400"
    if (status === "ended") return "text-white/60"
    return "text-amber-400"
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Presentations</h1>
            <p className="text-white/70">
              Your presentations. Create one, attach a slide deck, and share the invite link with viewers.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={createLoading}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createLoading ? "Creating..." : "New presentation"}
          </Button>
        </div>

        {createError && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-2 text-sm">
            {createError}
            {createError.toLowerCase().includes("relation") && (
              <p className="mt-1 text-red-200/80 text-xs">Run the Supabase migration (019_meetings.sql) to create the meetings tables.</p>
            )}
          </div>
        )}

        {loadError && (
          <div className="rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-2 text-sm">
            {loadError}
          </div>
        )}

        {loadInfo && (
          <div className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
            {loadInfo}
          </div>
        )}

        {loading ? (
          <div className="text-white/60">Loading...</div>
        ) : meetings.length === 0 ? (
          <Card className="border-white/20 bg-white/5">
            <CardContent className="py-12 text-center">
              <Video className="h-12 w-12 mx-auto text-white/40 mb-4" />
              <p className="text-white/80 mb-2">No presentations yet</p>
              <p className="text-white/60 text-sm mb-4">Create a presentation to host a live session with slides.</p>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={createLoading}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create presentation
              </Button>
              {createError && (
                <p className="mt-3 text-sm text-red-300">{createError}</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {meetings.map((m) => (
              <Link key={m.id} href={`/portal/meetings/${m.id}`}>
                <Card className="border-white/20 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-white/10 p-3">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{m.title}</p>
                        <p className="text-sm text-white/60 flex items-center gap-2">
                          <span className={statusColor(m.status)}>{m.status}</span>
                          {m.starts_at && (
                            <>
                              <Calendar className="h-3 w-3" />
                              {new Date(m.starts_at).toLocaleString()}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={statusColor(m.status)}>{m.status}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
