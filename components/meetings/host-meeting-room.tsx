"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SlideViewer } from "./slide-viewer"
import { ScriptPanel } from "./script-panel"
import { CameraPreview } from "./camera-preview"
import { ChevronLeft, ChevronRight, Copy, Radio, Square, Play, Settings2, Upload } from "lucide-react"
import type { PresentationSource } from "@/lib/presentation-source"
import { getRenderableSlideNotes } from "@/lib/presentation-source"

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
  presentationSource,
  decks = [],
  onSelectDeck,
  onUploadDeck,
  onSaveLink,
  onCreateDeck,
}: {
  meetingId: string
  meeting: Meeting
  deck: Deck
  slides: Slide[]
  initialState: State
  presentationSource: PresentationSource | null
  decks?: { id: string; title: string }[]
  onSelectDeck?: (deckId: string) => void
  onUploadDeck?: (deckId: string, file: File) => void | Promise<void>
  onSaveLink?: (deckId: string, externalUrl: string, label?: string) => void | Promise<void>
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
  const [savingLink, setSavingLink] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [linkInput, setLinkInput] = useState("")
  const [linkLabel, setLinkLabel] = useState("")
  const lastPublishedFrameRef = useRef<string | null>(null)

  const canNavigateSlides = presentationSource?.canNavigate ?? true
  const numSlides = canNavigateSlides ? slides.length : Math.max(slides.length, 1)
  const activeSlideIndex = canNavigateSlides ? Math.min(state.current_slide_index, Math.max(numSlides - 1, 0)) : 0
  const currentNotes = getRenderableSlideNotes(
    slides.find((s) => s.slide_index === activeSlideIndex)?.speaker_notes ?? null
  )

  useEffect(() => {
    setState(initialState)
  }, [initialState])

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
      } catch {
        setState(state)
      }
    },
    [meetingId, state]
  )

  const goPrev = () => {
    if (!canNavigateSlides || numSlides === 0) return
    updateState({ current_slide_index: Math.max(0, state.current_slide_index - 1) })
  }

  const goNext = () => {
    if (!canNavigateSlides || numSlides === 0) return
    updateState({ current_slide_index: Math.min(numSlides - 1, state.current_slide_index + 1) })
  }

  const startMeeting = async () => {
    try {
      await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "live" }),
      })
      window.location.reload()
    } catch {}
  }

  const endMeeting = async () => {
    try {
      await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ended" }),
      })
      window.location.reload()
    } catch {}
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
    } catch {
      setInviteError("Network error")
    } finally {
      setInviteLoading(false)
    }
  }, [meetingId])

  useEffect(() => {
    if (inviteUrl || inviteLoading) return
    createInvite()
  }, [inviteUrl, inviteLoading, createInvite])

  const copyInvite = () => {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        // no-op
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
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-white/20 bg-black/30 p-3">
        <div className="flex items-center gap-3">
          <Link href="/portal/meetings">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              ← Presentations
            </Button>
          </Link>
          <h1 className="truncate text-lg font-semibold text-white">{meeting.title}</h1>
          {meeting.status === "live" && (
            <span className="flex items-center gap-1 rounded bg-green-500/30 px-2 py-0.5 text-sm text-green-300">
              <Radio className="h-3 w-3" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {inviteUrl ? (
            <Button size="sm" variant="outline" onClick={copyInvite} className="border-white/30 text-white hover:bg-white/10">
              <Copy className="mr-1 h-4 w-4" />
              {copied ? "Copied!" : "Copy invite link"}
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={createInvite} disabled={inviteLoading} className="border-white/30 text-white hover:bg-white/10">
              {inviteLoading ? "..." : "Generate invite link"}
            </Button>
          )}
          {inviteError && <span className="text-xs text-red-300">{inviteError}</span>}
          {meeting.status === "draft" && (
            <Button size="sm" onClick={startMeeting} className="bg-green-600 text-white hover:bg-green-700">
              <Play className="mr-1 h-4 w-4" />
              Go live
            </Button>
          )}
          {meeting.status === "live" && (
            <Button size="sm" onClick={endMeeting} variant="destructive">
              <Square className="mr-1 h-4 w-4" />
              End meeting
            </Button>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-48 flex-col overflow-auto border-r border-white/20 bg-black/20">
          {meeting.status === "draft" && decks.length > 0 && (
            <div className="space-y-2 border-b border-white/10 p-2">
              <p className="text-xs font-medium text-white/70">Deck</p>
              <select
                value={meeting.deck_id ?? ""}
                onChange={(e) => {
                  if (e.target.value) onSelectDeck?.(e.target.value)
                }}
                className="w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white"
              >
                <option value="">Select deck</option>
                {decks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
              {onCreateDeck && (
                <button type="button" onClick={onCreateDeck} className="w-full text-xs text-white/80 hover:text-white">
                  + New deck
                </button>
              )}
              {deck && (
                <>
                  <label className={`flex cursor-pointer items-center gap-1 text-xs ${uploading ? "pointer-events-none text-white/50" : "text-white/70 hover:text-white"}`}>
                    <Upload className="h-3 w-3" />
                    <span>{uploading ? "Uploading…" : "Upload file"}</span>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.pps,.ppsx,.key,.odp,.doc,.docx,application/pdf"
                      className="hidden"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ""
                        if (!file || !onUploadDeck) return
                        setUploadError(null)
                        setUploading(true)
                        try {
                          await onUploadDeck(deck.id, file)
                        } catch (error) {
                          setUploadError(error instanceof Error ? error.message : "Upload failed")
                        } finally {
                          setUploading(false)
                        }
                      }}
                    />
                  </label>
                  <p className="text-[11px] text-white/45">PDF keeps slide sync. PowerPoint, Keynote, Docs, and similar files open as embedded viewers.</p>
                  {onSaveLink && (
                    <div className="space-y-2 rounded border border-white/10 bg-black/20 p-2">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">Shared link</p>
                      <input
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="Paste Google Slides, Doc, Canva, iCloud, or Office link"
                        className="w-full rounded border border-white/15 bg-white/10 px-2 py-1.5 text-xs text-white placeholder:text-white/35"
                      />
                      <input
                        type="text"
                        value={linkLabel}
                        onChange={(e) => setLinkLabel(e.target.value)}
                        placeholder="Optional label"
                        className="w-full rounded border border-white/15 bg-white/10 px-2 py-1.5 text-xs text-white placeholder:text-white/35"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={savingLink || !linkInput.trim()}
                        className="w-full bg-white/10 text-xs text-white hover:bg-white/20"
                        onClick={async () => {
                          if (!deck || !onSaveLink || !linkInput.trim()) return
                          setUploadError(null)
                          setSavingLink(true)
                          try {
                            await onSaveLink(deck.id, linkInput.trim(), linkLabel.trim() || undefined)
                            setLinkInput("")
                            setLinkLabel("")
                          } catch (error) {
                            setUploadError(error instanceof Error ? error.message : "Could not save link")
                          } finally {
                            setSavingLink(false)
                          }
                        }}
                      >
                        {savingLink ? "Saving..." : "Use shared link"}
                      </Button>
                    </div>
                  )}
                  {uploadError && <p className="text-xs text-red-300">{uploadError}</p>}
                </>
              )}
            </div>
          )}
          {meeting.status === "draft" && decks.length === 0 && (
            <div className="space-y-2 border-b border-white/10 p-2">
              <p className="text-xs font-medium text-white/70">Deck</p>
              <p className="text-xs text-white/50">Create a deck, then upload a file or paste a shared presentation link.</p>
              {onCreateDeck && (
                <button
                  type="button"
                  onClick={onCreateDeck}
                  className="w-full rounded border border-white/20 bg-white/10 px-2 py-1.5 text-xs text-white hover:bg-white/20"
                >
                  + New deck
                </button>
              )}
            </div>
          )}
          <p className="p-2 text-xs font-medium text-white/70">Slides</p>
          <div className="flex-1 overflow-auto">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => updateState({ current_slide_index: index })}
              className={`w-full border-l-2 px-2 py-1.5 text-left text-sm ${
                  activeSlideIndex === index
                    ? "border-white bg-white/10 text-white"
                    : "border-transparent text-white/70 hover:bg-white/5"
                }`}
              >
                {index + 1}
              </button>
            ))}
            {slides.length === 0 && <p className="px-2 py-2 text-xs text-white/50">No slides</p>}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col p-4">
          <SlideViewer presentationSource={presentationSource} pageIndex={activeSlideIndex} className="min-h-[320px] flex-1" />
          <div className="mt-3 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={goPrev}
              disabled={!canNavigateSlides || activeSlideIndex <= 0}
              className="border-white/30 text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-white/80">
              {activeSlideIndex + 1} / {numSlides || 1}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={goNext}
              disabled={!canNavigateSlides || activeSlideIndex >= numSlides - 1}
              className="border-white/30 text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {!canNavigateSlides && (
            <p className="mt-2 text-center text-xs text-white/50">
              This source stays embedded for both sides. For synced page-by-page control, upload a PDF deck.
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/70">
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
              Client sees presenter camera
            </label>
          </div>
        </main>

        <aside className="flex w-72 flex-col gap-3 border-l border-white/20 bg-black/20 p-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-white/60" />
            <span className="text-sm font-medium text-white/80">Agent panel</span>
          </div>
          <CameraPreview className="h-32" onFrame={publishCameraFrame} />
          <p className="text-xs text-white/50">The client only sees the slide deck and your camera. This script stays private to the agent.</p>
          <ScriptPanel
            notes={currentNotes}
            darkMode={scriptDark}
            fontSize={scriptFontSize}
            onFontSizeChange={(delta) => setScriptFontSize((size) => Math.max(12, Math.min(24, size + delta)))}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setScriptDark((value) => !value)} className="border-white/30 text-xs text-white">
              {scriptDark ? "Light" : "Dark"} mode
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
