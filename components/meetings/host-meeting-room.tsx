"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SlideViewer } from "./slide-viewer"
import { ScriptPanel } from "./script-panel"
import { CameraPreview } from "./camera-preview"
import { ChevronDown, ChevronLeft, ChevronRight, Copy, Radio, Square, Play, Settings2, Upload, FileText, MonitorUp, MonitorOff, RefreshCw } from "lucide-react"
import type { PresentationSource } from "@/lib/presentation-source"
import { getRenderableSlideNotes } from "@/lib/presentation-source"
import { broadcastMeetingScreenShare, createMeetingLiveChannel, type MeetingLiveSharePayload } from "@/lib/meeting-live-channel"
import type { RealtimeChannel } from "@supabase/supabase-js"

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
  onCreateDeck?: () => Promise<{ id: string; title: string } | null | void> | { id: string; title: string } | null | void
}) {
  const [state, setState] = useState(initialState)
  const [showSetup, setShowSetup] = useState(meeting.status === "draft")
  const [showDeckPanel, setShowDeckPanel] = useState(true)
  const [showPresentationPanel, setShowPresentationPanel] = useState(true)
  const [showScriptUploadPanel, setShowScriptUploadPanel] = useState(true)
  const [showLinkPanel, setShowLinkPanel] = useState(true)
  const [scriptFontSize, setScriptFontSize] = useState(16)
  const [scriptDark, setScriptDark] = useState(false)
  const [meetingScript, setMeetingScript] = useState("")
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savingLink, setSavingLink] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [linkInput, setLinkInput] = useState("")
  const [linkLabel, setLinkLabel] = useState("")
  const [sharedScreen, setSharedScreen] = useState<MeetingLiveSharePayload | null>(null)
  const [screenShareError, setScreenShareError] = useState<string | null>(null)
  const [startingScreenShare, setStartingScreenShare] = useState(false)
  const lastPublishedFrameRef = useRef<string | null>(null)
  const deckUploadInputRef = useRef<HTMLInputElement | null>(null)
  const scriptUploadInputRef = useRef<HTMLInputElement | null>(null)
  const liveChannelRef = useRef<RealtimeChannel | null>(null)
  const screenVideoRef = useRef<HTMLVideoElement | null>(null)
  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const screenCaptureIntervalRef = useRef<number | null>(null)

  const canNavigateSlides = presentationSource?.canNavigate ?? true
  const numSlides = canNavigateSlides ? slides.length : Math.max(slides.length, 1)
  const activeSlideIndex = canNavigateSlides ? Math.min(state.current_slide_index, Math.max(numSlides - 1, 0)) : 0
  const currentNotes = getRenderableSlideNotes(
    slides.find((s) => s.slide_index === activeSlideIndex)?.speaker_notes ?? null
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    const savedScript = window.localStorage.getItem(`meeting-script:${meetingId}`)
    if (savedScript) {
      setMeetingScript(savedScript)
    }
  }, [meetingId])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (meetingScript.trim()) {
      window.localStorage.setItem(`meeting-script:${meetingId}`, meetingScript)
      return
    }
    window.localStorage.removeItem(`meeting-script:${meetingId}`)
  }, [meetingId, meetingScript])

  useEffect(() => {
    setState(initialState)
  }, [initialState])

  useEffect(() => {
    const channel = createMeetingLiveChannel(meetingId, (payload) => {
      setSharedScreen(payload.active ? payload : null)
    })
    liveChannelRef.current = channel
    return () => {
      void channel.unsubscribe()
      liveChannelRef.current = null
    }
  }, [meetingId])

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)

      if (isTypingTarget || event.metaKey || event.ctrlKey || event.altKey) return
      if (!canNavigateSlides || sharedScreen?.active || numSlides <= 1) return

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        goPrev()
      }

      if (event.key === "ArrowRight") {
        event.preventDefault()
        goNext()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [canNavigateSlides, numSlides, sharedScreen?.active, state.current_slide_index])

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

  const loadInvite = useCallback(async () => {
    setInviteError(null)
    setInviteLoading(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/invite`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 404) {
          setInviteUrl(null)
          setInviteExpiresAt(null)
          return
        }
        setInviteError(data?.error ?? "Could not load invite")
        return
      }
      if (data.joinUrl) {
        setInviteUrl(data.joinUrl)
        setInviteExpiresAt(data?.invite?.expires_at ?? null)
        setCopied(false)
      } else {
        setInviteError(data?.error ?? "Could not load invite")
      }
    } catch {
      setInviteError("Network error")
    } finally {
      setInviteLoading(false)
    }
  }, [meetingId])

  const createInvite = useCallback(async (regenerate = false) => {
    setInviteError(null)
    setInviteLoading(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInHours: 24, regenerate }),
      })
      const data = await res.json()
      if (res.ok && data.joinUrl) {
        setInviteUrl(data.joinUrl)
        setInviteExpiresAt(data?.invite?.expires_at ?? null)
        setCopied(false)
      } else {
        setInviteError(data?.error ?? "Could not create link")
      }
    } catch {
      setInviteError("Network error")
    } finally {
      setInviteLoading(false)
    }
  }, [meetingId])

  useEffect(() => {
    void loadInvite()
  }, [loadInvite])

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
      stopLocalScreenShare()
    }
  }, [meetingId])

  const stopLocalScreenShare = useCallback(async () => {
    if (screenCaptureIntervalRef.current) {
      window.clearInterval(screenCaptureIntervalRef.current)
      screenCaptureIntervalRef.current = null
    }
    screenStreamRef.current?.getTracks().forEach((track) => track.stop())
    screenStreamRef.current = null
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null
    }
    const payload: MeetingLiveSharePayload = {
      active: false,
      frame: null,
      sourceLabel: null,
      updatedAt: Date.now(),
    }
    setSharedScreen(null)
    if (liveChannelRef.current) {
      await broadcastMeetingScreenShare(liveChannelRef.current, payload).catch(() => undefined)
    }
  }, [])

  const ensureDeckForContent = useCallback(async () => {
    if (deck) return deck
    if (!onCreateDeck) return null
    const createdDeck = await onCreateDeck()
    return createdDeck ?? null
  }, [deck, onCreateDeck])

  const allSetupPanelsOpen = showDeckPanel && showPresentationPanel && showScriptUploadPanel && showLinkPanel

  const toggleAllSetupPanels = () => {
    const nextValue = !allSetupPanelsOpen
    setShowDeckPanel(nextValue)
    setShowPresentationPanel(nextValue)
    setShowScriptUploadPanel(nextValue)
    setShowLinkPanel(nextValue)
  }

  const glassButtonClass =
    "border-white/14 bg-white/[0.08] text-white shadow-[0_10px_30px_rgba(15,23,42,0.22)] backdrop-blur-xl hover:bg-white/[0.14] hover:border-white/22"
  const glassPanelClass = "border border-white/10 bg-white/[0.06] shadow-[0_20px_60px_rgba(2,6,23,0.32)] backdrop-blur-2xl"

  const startLocalScreenShare = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      setScreenShareError("Screen sharing is not available in this browser.")
      return
    }

    setScreenShareError(null)
    setStartingScreenShare(true)
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 2, max: 4 },
        },
        audio: false,
      })

      await stopLocalScreenShare()

      screenStreamRef.current = stream
      const video = document.createElement("video")
      video.muted = true
      video.playsInline = true
      video.srcObject = stream
      screenVideoRef.current = video
      await video.play()

      const canvas = document.createElement("canvas")
      screenCanvasRef.current = canvas

      const publishFrame = async () => {
        if (!screenVideoRef.current || !screenCanvasRef.current || !liveChannelRef.current) return
        const sourceVideo = screenVideoRef.current
        const sourceWidth = sourceVideo.videoWidth || 1280
        const sourceHeight = sourceVideo.videoHeight || 720
        const maxWidth = 1280
        const scale = Math.min(1, maxWidth / sourceWidth)
        canvas.width = Math.max(1, Math.floor(sourceWidth * scale))
        canvas.height = Math.max(1, Math.floor(sourceHeight * scale))
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height)
        const frame = canvas.toDataURL("image/jpeg", 0.72)
        const payload: MeetingLiveSharePayload = {
          active: true,
          frame,
          sourceLabel: "Local presentation window",
          updatedAt: Date.now(),
        }
        setSharedScreen(payload)
        await broadcastMeetingScreenShare(liveChannelRef.current, payload).catch(() => undefined)
      }

      void publishFrame()
      screenCaptureIntervalRef.current = window.setInterval(() => {
        void publishFrame()
      }, 900)

      const [videoTrack] = stream.getVideoTracks()
      videoTrack?.addEventListener("ended", () => {
        void stopLocalScreenShare()
      })
    } catch (error) {
      setScreenShareError(error instanceof Error ? error.message : "Could not start local window sharing.")
    } finally {
      setStartingScreenShare(false)
    }
  }, [stopLocalScreenShare])

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_30%),linear-gradient(180deg,#07101d_0%,#09111f_100%)]">
      <header className="flex items-center justify-between border-b border-white/10 bg-black/10 px-5 py-4 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/portal/meetings">
            <Button variant="ghost" size="sm" className="text-white/90 hover:bg-white/10">
              ← Presentations
            </Button>
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Host room</p>
            <h1 className="truncate text-lg font-semibold text-white">{meeting.title}</h1>
          </div>
          {meeting.status === "live" && (
            <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-1 text-xs text-green-300">
              <Radio className="h-3 w-3" />
              Live
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {meeting.status === "draft" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSetup((value) => !value)}
              className={glassButtonClass}
            >
              <Settings2 className="mr-1 h-4 w-4" />
              {showSetup ? "Hide settings" : "Show settings"}
            </Button>
          )}
          {inviteUrl ? (
            <>
              <Button size="sm" variant="outline" onClick={copyInvite} className={glassButtonClass}>
                <Copy className="mr-1 h-4 w-4" />
                {copied ? "Copied" : "Invite link"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => createInvite(true)}
                disabled={inviteLoading}
                className={glassButtonClass}
              >
                <RefreshCw className="mr-1 h-4 w-4" />
                Regenerate
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={createInvite} disabled={inviteLoading} className={glassButtonClass}>
              {inviteLoading ? "..." : "Generate invite link"}
            </Button>
          )}
          {inviteError && <span className="text-xs text-red-300">{inviteError}</span>}
          {!inviteError && inviteExpiresAt && (
            <span className="text-xs text-white/45">
              Expires {new Date(inviteExpiresAt).toLocaleDateString()} {new Date(inviteExpiresAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
          {meeting.status === "draft" && (
            <Button size="sm" onClick={startMeeting} className="border border-emerald-300/20 bg-emerald-500/78 text-white shadow-[0_12px_30px_rgba(16,185,129,0.28)] backdrop-blur-xl hover:bg-emerald-400/80">
              <Play className="mr-1 h-4 w-4" />
              Go live
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (sharedScreen?.active) {
                void stopLocalScreenShare()
              } else {
                void startLocalScreenShare()
              }
            }}
            disabled={startingScreenShare}
            className={glassButtonClass}
          >
            {sharedScreen?.active ? (
              <>
                <MonitorOff className="mr-1 h-4 w-4" />
                Stop local share
              </>
            ) : (
              <>
                <MonitorUp className="mr-1 h-4 w-4" />
                {startingScreenShare ? "Starting..." : "Share local window"}
              </>
            )}
          </Button>
          {meeting.status === "live" && (
            <Button size="sm" onClick={endMeeting} variant="destructive">
              <Square className="mr-1 h-4 w-4" />
              End meeting
            </Button>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-5 p-5">
        <main className="flex min-w-0 flex-1 flex-col">
          <section className={`flex min-h-[320px] flex-1 flex-col rounded-[2rem] ${glassPanelClass} p-5`}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Stage</p>
                <p className="text-sm text-white/70">
                  {sharedScreen?.active ? "Live shared presentation" : presentationSource ? "Current presentation" : "Add a presentation to begin"}
                </p>
              </div>
              {!sharedScreen?.active && numSlides > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={goPrev}
                    disabled={!canNavigateSlides || activeSlideIndex <= 0}
                    className={glassButtonClass}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-16 text-center text-sm text-white/75">
                    {activeSlideIndex + 1} / {numSlides}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={goNext}
                    disabled={!canNavigateSlides || activeSlideIndex >= numSlides - 1}
                    className={glassButtonClass}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30">
              {sharedScreen?.active && sharedScreen.frame ? (
                <div className="flex h-full items-center justify-center overflow-hidden p-4">
                  <img
                    src={sharedScreen.frame}
                    alt={sharedScreen.sourceLabel ?? "Shared local presentation"}
                    className="max-h-full max-w-full rounded-md object-contain shadow-lg"
                  />
                </div>
              ) : (
                <SlideViewer presentationSource={presentationSource} pageIndex={activeSlideIndex} className="h-full min-h-[320px]" />
              )}
            </div>

            {slides.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => updateState({ current_slide_index: index })}
                    className={`min-w-12 rounded-xl border px-3 py-2 text-sm transition ${
                      activeSlideIndex === index
                        ? "border-white/40 bg-white/12 text-white"
                        : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.08]"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}

            {!sharedScreen?.active && !canNavigateSlides && (
              <p className="mt-3 text-center text-xs text-white/45">
                Use PDF or Google Slides for the cleanest in-app presenting.
              </p>
            )}
            {screenShareError && <p className="mt-3 text-center text-xs text-red-300">{screenShareError}</p>}
          </section>

          <div className="flex flex-wrap items-center gap-5 px-2 text-sm text-white/65">
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
        </main>

        <aside className={`flex w-[24rem] shrink-0 flex-col gap-4 rounded-[2rem] ${glassPanelClass} p-4`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Presentation settings</p>
              <p className="mt-1 text-sm text-white/65">Upload the presentation, attach the host script, and control the presenter view.</p>
            </div>
            {meeting.status === "draft" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={toggleAllSetupPanels}
                className={`${glassButtonClass} shrink-0`}
              >
                {allSetupPanelsOpen ? "Collapse all" : "Expand all"}
              </Button>
            )}
          </div>

          {meeting.status === "draft" && showSetup && (
            <div className="space-y-3">
              <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                <button
                  type="button"
                  onClick={() => setShowDeckPanel((value) => !value)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">Presentation slot</span>
                  <ChevronDown className={`h-4 w-4 text-white/55 transition-transform ${showDeckPanel ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {showDeckPanel && (
                  <div className="space-y-3 pt-1">
                    {decks.length > 0 ? (
                      <select
                        value={meeting.deck_id ?? ""}
                        onChange={(e) => {
                          if (e.target.value) onSelectDeck?.(e.target.value)
                        }}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"
                      >
                        <option value="">Select presentation</option>
                        {decks.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/55">No presentation yet</p>
                    )}
                    {onCreateDeck && (
                      <Button type="button" size="sm" variant="outline" onClick={onCreateDeck} className={`w-full ${glassButtonClass}`}>
                        Create new presentation
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                <button
                  type="button"
                  onClick={() => setShowPresentationPanel((value) => !value)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">Presentation file</span>
                  <ChevronDown className={`h-4 w-4 text-white/55 transition-transform ${showPresentationPanel ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {showPresentationPanel && (
                  <div className="space-y-3 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={uploading}
                      className={`w-full ${glassButtonClass}`}
                      onClick={() => deckUploadInputRef.current?.click()}
                    >
                      <Upload className="mr-1 h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload presentation"}
                    </Button>
                    <input
                      ref={deckUploadInputRef}
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
                          const targetDeck = await ensureDeckForContent()
                          if (!targetDeck) {
                            throw new Error("Could not create a presentation slot for this file.")
                          }
                          await onUploadDeck(targetDeck.id, file)
                        } catch (error) {
                          setUploadError(error instanceof Error ? error.message : "Upload failed")
                        } finally {
                          setUploading(false)
                        }
                      }}
                    />
                    <p className="text-xs leading-5 text-white/42">
                      Upload PDF, PowerPoint, Keynote, or similar deck files. When possible, Pantheon converts them into a stage-ready PDF for both host and client.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                <button
                  type="button"
                  onClick={() => setShowScriptUploadPanel((value) => !value)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">Host script</span>
                  <ChevronDown className={`h-4 w-4 text-white/55 transition-transform ${showScriptUploadPanel ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {showScriptUploadPanel && (
                  <div className="space-y-3 pt-1">
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" className={`flex-1 ${glassButtonClass}`} onClick={() => scriptUploadInputRef.current?.click()}>
                        <FileText className="mr-1 h-4 w-4" />
                        Upload script
                      </Button>
                      {meetingScript.trim() && (
                        <Button type="button" size="sm" variant="outline" className={glassButtonClass} onClick={() => setMeetingScript("")}>
                          Clear
                        </Button>
                      )}
                    </div>
                    <input
                      ref={scriptUploadInputRef}
                      type="file"
                      accept=".txt,.md,text/plain,text/markdown"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ""
                        if (!file) return
                        setUploadError(null)
                        try {
                          const text = await file.text()
                          setMeetingScript(text)
                        } catch (error) {
                          setUploadError(error instanceof Error ? error.message : "Could not import script")
                        }
                      }}
                    />
                    <p className="text-xs leading-5 text-white/42">Import plain text or markdown for the presenter teleprompter. This stays private to the host.</p>
                  </div>
                )}
              </div>

              {onSaveLink && (
                <div className="space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <button
                    type="button"
                    onClick={() => setShowLinkPanel((value) => !value)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">Shared link</span>
                    <ChevronDown className={`h-4 w-4 text-white/55 transition-transform ${showLinkPanel ? "rotate-0" : "-rotate-90"}`} />
                  </button>
                  {showLinkPanel && (
                    <div className="space-y-3 pt-1">
                      <input
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="Paste Google Slides or shared link"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/28"
                      />
                      <input
                        type="text"
                        value={linkLabel}
                        onChange={(e) => setLinkLabel(e.target.value)}
                        placeholder="Optional label"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/28"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={savingLink || !linkInput.trim()}
                        className={`w-full ${glassButtonClass}`}
                        onClick={async () => {
                          if (!onSaveLink || !linkInput.trim()) return
                          setUploadError(null)
                          setSavingLink(true)
                          try {
                            const targetDeck = await ensureDeckForContent()
                            if (!targetDeck) {
                              throw new Error("Could not create a presentation slot for this link.")
                            }
                            await onSaveLink(targetDeck.id, linkInput.trim(), linkLabel.trim() || undefined)
                            setLinkInput("")
                            setLinkLabel("")
                          } catch (error) {
                            setUploadError(error instanceof Error ? error.message : "Could not save link")
                          } finally {
                            setSavingLink(false)
                          }
                        }}
                      >
                        {savingLink ? "Saving..." : "Save link"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {uploadError && <p className="text-sm text-red-300">{uploadError}</p>}
            </div>
          )}

          <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Presenter tools</p>
              <p className="mt-1 text-sm text-white/65">Private notes and camera preview.</p>
            </div>
            <CameraPreview className="h-40 rounded-2xl" onFrame={publishCameraFrame} />
          </div>
          <ScriptPanel
            notes={currentNotes}
            meetingScript={meetingScript}
            darkMode={scriptDark}
            fontSize={scriptFontSize}
            onFontSizeChange={(delta) => setScriptFontSize((size) => Math.max(12, Math.min(24, size + delta)))}
            className="min-h-0 flex-1"
          />
          <Button size="sm" variant="outline" onClick={() => setScriptDark((value) => !value)} className={glassButtonClass}>
            {scriptDark ? "Light script" : "Dark script"}
          </Button>
        </aside>
      </div>
    </div>
  )
}
