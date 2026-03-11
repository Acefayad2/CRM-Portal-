"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SlideViewer } from "./slide-viewer"
import { ScriptPanel } from "./script-panel"
import { CameraPreview } from "./camera-preview"
import { ChevronLeft, ChevronRight, Copy, Radio, Square, Play, Settings2, Upload, MonitorPlay, UserRound } from "lucide-react"

type Meeting = {
  id: string
  title: string
  status: string
  deck_id: string | null
}

type Deck = { id: string; title: string } | null
type Slide = { id: string; slide_index: number; storage_path: string; speaker_notes: string | null }
type State = {
  current_slide_index: number
  allow_client_navigation: boolean
  host_camera_frame?: string | null
  host_camera_updated_at?: string | null
  show_host_camera?: boolean
}

export function HostMeetingRoom({
  meetingId,
  meeting,
  deck,
  slides,
  initialState,
  pdfUrl,
  decks = [],
  onSelectDeck,
  onUploadPdf,
}: {
  meetingId: string
  meeting: Meeting
  deck: Deck
  slides: Slide[]
  initialState: State
  pdfUrl: string | null
  decks?: { id: string; title: string }[]
  onSelectDeck?: (deckId: string) => void
  onUploadPdf?: (deckId: string, file: File) => void
  onCreateDeck?: () => void
}) {
  const [state, setState] = useState(initialState)
  const [scriptFontSize, setScriptFontSize] = useState(16)
  const [scriptDark, setScriptDark] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const lastPublishedFrameRef = useRef<string | null>(null)

  const currentNotes = slides.find((s) => s.slide_index === state.current_slide_index)?.speaker_notes ?? null
  const numSlides = slides.length

  const updateState = useCallback(
    async (patch: Partial<State>) => {
      const next = { ...state, ...patch }
      setState(next)
      try {
        await fetch(`/api/meetings/${meetingId}/state`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        })
      } catch (_e) {
        setState(state)
      }
    },
    [meetingId, state]
  )

  const goPrev = () => {
    if (numSlides === 0) return
    const next = Math.max(0, state.current_slide_index - 1)
    updateState({ current_slide_index: next })
  }
  const goNext = () => {
    if (numSlides === 0) return
    const next = Math.min(numSlides - 1, state.current_slide_index + 1)
    updateState({ current_slide_index: next })
  }

  const startMeeting = async () => {
    try {
      await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "live" }),
      })
      window.location.reload()
    } catch (_e) {}
  }
  const endMeeting = async () => {
    try {
      await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ended" }),
      })
      window.location.reload()
    } catch (_e) {}
  }

  const createInvite = useCallback(async () => {
    setInviteError(null)
    setInviteLoading(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInHours: 24 }),
      })
      const data = await res.json()
      if (data.joinUrl) setInviteUrl(data.joinUrl)
      else setInviteError(data?.error ?? "Could not create link")
    } catch (_e) {
      setInviteError("Network error")
    } finally {
      setInviteLoading(false)
    }
  }, [meetingId])

  useEffect(() => {
    if (inviteUrl || inviteLoading) return
    createInvite()
  }, [meetingId, inviteUrl, inviteLoading, createInvite])

  const copyInvite = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const publishCameraFrame = useCallback(
    async (frame: string) => {
      if (lastPublishedFrameRef.current === frame) return
      lastPublishedFrameRef.current = frame
      try {
        await fetch(`/api/meetings/${meetingId}/state`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ host_camera_frame: frame }),
        })
      } catch {
        // ignore frame publish failures; local preview remains available
      }
    },
    [meetingId]
  )

  useEffect(() => {
    return () => {
      void fetch(`/api/meetings/${meetingId}/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host_camera_frame: null }),
      }).catch(() => undefined)
    }
  }, [meetingId])

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-3 border-b border-white/20 bg-black/30">
        <div className="flex items-center gap-3">
          <Link href="/portal/meetings">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              ← Presentations
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-white truncate">{meeting.title}</h1>
          {meeting.status === "live" && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/30 text-green-300 text-sm">
              <Radio className="h-3 w-3" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {inviteUrl ? (
            <Button
              size="sm"
              variant="outline"
              onClick={copyInvite}
              className="text-white border-white/30 hover:bg-white/10"
            >
              <Copy className="h-4 w-4 mr-1" />
              {copied ? "Copied!" : "Copy invite link"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={createInvite}
              disabled={inviteLoading}
              className="text-white border-white/30 hover:bg-white/10"
            >
              {inviteLoading ? "..." : "Generate invite link"}
            </Button>
          )}
          {inviteError && <span className="text-xs text-red-300">{inviteError}</span>}
          {meeting.status === "draft" && (
            <Button size="sm" onClick={startMeeting} className="bg-green-600 hover:bg-green-700 text-white">
              <Play className="h-4 w-4 mr-1" />
              Go live
            </Button>
          )}
          {meeting.status === "live" && (
            <Button size="sm" onClick={endMeeting} variant="destructive">
              <Square className="h-4 w-4 mr-1" />
              End meeting
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Left: deck selector (draft) + thumbnails / slide list */}
        <aside className="w-48 border-r border-white/20 flex flex-col bg-black/20 overflow-auto">
          {meeting.status === "draft" && decks.length > 0 && (
            <div className="p-2 border-b border-white/10 space-y-2">
              <p className="text-xs font-medium text-white/70">Deck</p>
              <select
                value={meeting.deck_id ?? ""}
                onChange={(e) => {
                  const v = e.target.value
                  if (v) onSelectDeck?.(v)
                }}
                className="w-full rounded bg-white/10 text-white text-xs border border-white/20 px-2 py-1"
              >
                <option value="">Select deck</option>
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
              {onCreateDeck && (
                <button
                  type="button"
                  onClick={onCreateDeck}
                  className="w-full text-xs text-white/80 hover:text-white"
                >
                  + New deck
                </button>
              )}
              {deck && (
                <>
                  <label className={`flex items-center gap-1 text-xs cursor-pointer ${uploading ? "text-white/50 pointer-events-none" : "text-white/70 hover:text-white"}`}>
                    <Upload className="h-3 w-3" />
                    <span>{uploading ? "Uploading…" : "Upload PDF"}</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      disabled={uploading}
                      onChange={async (e) => {
                        const f = e.target.files?.[0]
                        e.target.value = ""
                        if (!f || !onUploadPdf) return
                        setUploadError(null)
                        setUploading(true)
                        try {
                          await onUploadPdf(deck.id, f)
                        } catch {
                          setUploadError("Upload failed")
                        } finally {
                          setUploading(false)
                        }
                      }}
                    />
                  </label>
                  {uploadError && <p className="text-xs text-red-300">{uploadError}</p>}
                </>
              )}
            </div>
          )}
          {meeting.status === "draft" && decks.length === 0 && (
            <div className="p-2 border-b border-white/10 space-y-2">
              <p className="text-xs font-medium text-white/70">Deck</p>
              <p className="text-xs text-white/50">Create a deck, then upload a PDF to get started.</p>
              {onCreateDeck && (
                <button
                  type="button"
                  onClick={onCreateDeck}
                  className="w-full rounded bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-1.5 border border-white/20"
                >
                  + New deck
                </button>
              )}
            </div>
          )}
          <p className="p-2 text-xs font-medium text-white/70">Slides</p>
          <div className="flex-1 overflow-auto">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => updateState({ current_slide_index: i })}
                className={`w-full text-left px-2 py-1.5 text-sm border-l-2 ${
                  state.current_slide_index === i
                    ? "border-white bg-white/10 text-white"
                    : "border-transparent text-white/70 hover:bg-white/5"
                }`}
              >
                {i + 1}
              </button>
            ))}
            {slides.length === 0 && <p className="px-2 py-2 text-white/50 text-xs">No slides</p>}
          </div>
        </aside>

        {/* Center: host call workspace */}
        <main className="flex-1 min-w-0 p-4">
          <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,1.3fr)_360px]">
            <section className="flex min-h-0 flex-col rounded-xl border border-white/20 bg-black/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Client view</p>
                  <p className="text-xs text-white/60">Only the presentation and your presenter camera are shared with the client.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <MonitorPlay className="h-4 w-4" />
                  Shared output
                </div>
              </div>
              <SlideViewer
                pdfUrl={pdfUrl}
                pageIndex={state.current_slide_index}
                className="flex-1 min-h-[320px]"
              />
              <div className="mt-3 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={goPrev}
                  disabled={state.current_slide_index <= 0}
                  className="text-white border-white/30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-white/80 text-sm">
                  {state.current_slide_index + 1} / {numSlides || 1}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={goNext}
                  disabled={state.current_slide_index >= numSlides - 1}
                  className="text-white border-white/30"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={state.allow_client_navigation}
                    onChange={(e) => updateState({ allow_client_navigation: e.target.checked })}
                    className="rounded border-white/30"
                  />
                  Allow client to change slides
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={state.show_host_camera ?? true}
                    onChange={(e) => updateState({ show_host_camera: e.target.checked })}
                    className="rounded border-white/30"
                  />
                  Show presenter camera
                </label>
              </div>
            </section>

            <aside className="flex min-h-0 flex-col gap-3 rounded-xl border border-white/20 bg-black/20 p-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-white/60" />
                <span className="text-sm font-medium text-white/80">Agent controls</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-2">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <UserRound className="h-4 w-4" />
                    Presenter camera
                  </div>
                  <span className="text-xs text-white/60">
                    {state.show_host_camera ?? true ? "Visible to client" : "Hidden from client"}
                  </span>
                </div>
                <CameraPreview className="h-44" onFrame={publishCameraFrame} />
              </div>
              <div className="min-h-0 flex-1">
                <ScriptPanel
                  notes={currentNotes}
                  darkMode={scriptDark}
                  fontSize={scriptFontSize}
                  onFontSizeChange={(d) => setScriptFontSize((f) => Math.max(12, Math.min(24, f + d)))}
                  className="h-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setScriptDark((d) => !d)}
                  className="text-white border-white/30 text-xs"
                >
                  {scriptDark ? "Light" : "Dark"} mode
                </Button>
              </div>
            </aside>
          </div>
        </main>

        {/* Right: compact status rail */}
        <aside className="w-20 border-l border-white/20 flex flex-col items-center gap-3 p-3 bg-black/20">
          <div className="flex items-center gap-2">
            <MonitorPlay className="h-4 w-4 text-white/60" />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-3 text-center">
            <p className="text-[10px] uppercase tracking-wide text-white/50">Client nav</p>
            <p className="mt-1 text-xs text-white">{state.allow_client_navigation ? "On" : "Off"}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-3 text-center">
            <p className="text-[10px] uppercase tracking-wide text-white/50">Camera</p>
            <p className="mt-1 text-xs text-white">{state.show_host_camera ?? true ? "On" : "Off"}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
