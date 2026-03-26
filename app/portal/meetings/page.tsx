"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PortalLayout } from "@/components/portal-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Video, Calendar, Trash2 } from "lucide-react"

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
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newMeetingTitle, setNewMeetingTitle] = useState("New Presentation")

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
        body: JSON.stringify({ title: newMeetingTitle.trim() || "New Presentation" }),
      })
      const data = await res.json()
      if (res.ok && data.meeting) {
        setCreateDialogOpen(false)
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

  const handleDelete = async (meetingId: string, meetingTitle: string) => {
    const confirmed = window.confirm(`Delete presentation "${meetingTitle}"?`)
    if (!confirmed) return

    setDeleteError(null)
    setDeletingId(meetingId)
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setDeleteError(typeof data.error === "string" ? data.error : "Failed to delete presentation.")
        return
      }
      setMeetings((current) => current.filter((meeting) => meeting.id !== meetingId))
    } catch {
      setDeleteError("Network error while deleting presentation.")
    } finally {
      setDeletingId(null)
    }
  }

  const statusColor = (status: string) => {
    if (status === "live") return "text-green-400"
    if (status === "ended") return "text-white/60"
    return "text-amber-400"
  }

  return (
    <PortalLayout>
      <section className="min-h-[calc(100vh-2rem)] rounded-[28px] border border-white/10 bg-slate-950/35 shadow-[0_25px_80px_rgba(2,6,23,0.35)] backdrop-blur-md">
        <div className="space-y-6 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Presentations</h1>
              <p className="text-white/70">
                Your presentations. Create one, upload a slide deck, and share the invite link with viewers.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                setCreateError(null)
                setNewMeetingTitle("New Presentation")
                setCreateDialogOpen(true)
              }}
              disabled={createLoading}
              className="w-full shrink-0 bg-white/10 hover:bg-white/20 text-white border-white/20 sm:w-auto"
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

          {deleteError && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-2 text-sm">
              {deleteError}
            </div>
          )}

          {loading ? (
            <div className="text-white/60">Loading...</div>
          ) : meetings.length === 0 ? (
            <Card className="border-white/20 bg-white/5">
              <CardContent className="py-12 text-center">
                <Video className="h-12 w-12 mx-auto text-white/40 mb-4" />
                <p className="text-white/80 mb-2">No presentations yet</p>
                <p className="text-white/60 text-sm mb-4">Create a presentation to host a live session with an uploaded slide deck.</p>
                <Button
                  type="button"
                  onClick={() => {
                    setCreateError(null)
                    setNewMeetingTitle("New Presentation")
                    setCreateDialogOpen(true)
                  }}
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
                <Card key={m.id} className="border-white/20 bg-white/5 transition-colors hover:bg-white/10">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <Link href={`/portal/meetings/${m.id}`} className="min-w-0 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-white/10 p-3">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{m.title}</p>
                          <p className="flex flex-wrap items-center gap-2 text-sm text-white/60">
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
                    </Link>
                    <div className="flex items-center gap-3">
                      <span className={statusColor(m.status)}>{m.status}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={deletingId === m.id}
                        className="border-red-500/30 text-red-200 hover:bg-red-500/15 hover:text-red-100"
                        onClick={() => void handleDelete(m.id, m.title)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {deletingId === m.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open)
          if (!open) setCreateError(null)
        }}
      >
        <DialogContent className="border-white/15 bg-[#101828] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Name your presentation</DialogTitle>
            <DialogDescription className="text-white/60">
              Give this presentation a title before creating it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="presentation-title" className="text-sm text-white/70">
              Presentation name
            </label>
            <input
              id="presentation-title"
              type="text"
              value={newMeetingTitle}
              onChange={(e) => setNewMeetingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !createLoading) {
                  e.preventDefault()
                  void handleCreate()
                }
              }}
              placeholder="Enter presentation name"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              autoFocus
            />
            {createError && <p className="text-sm text-red-300">{createError}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="border-white/15 bg-transparent text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleCreate()}
              disabled={createLoading}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              {createLoading ? "Creating..." : "Create presentation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  )
}
