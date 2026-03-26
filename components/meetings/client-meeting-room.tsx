"use client"

import { useState, useEffect, useCallback } from "react"
import { SlideViewer } from "./slide-viewer"
import { ChevronLeft, ChevronRight, Wifi, WifiOff } from "lucide-react"
import type { PresentationSource } from "@/lib/presentation-source"
import { createMeetingLiveChannel, type MeetingLiveSharePayload } from "@/lib/meeting-live-channel"

type State = {
  current_slide_index: number
  allow_client_navigation: boolean
  host_camera_frame?: string | null
  host_camera_updated_at?: string | null
  show_host_camera?: boolean
}

const POLL_INTERVAL_MS = 2000

export function ClientMeetingRoom({
  token,
  initialMeeting,
  initialState,
  initialSlides,
  presentationSource,
}: {
  token: string
  initialMeeting: { id: string; title: string; status: string }
  initialState: State
  initialSlides: { id: string; slide_index: number; storage_path: string }[]
  presentationSource: PresentationSource | null
}) {
  const [state, setState] = useState(initialState)
  const [connected, setConnected] = useState(true)
  const [sharedScreen, setSharedScreen] = useState<MeetingLiveSharePayload | null>(null)
  const canNavigateSlides = presentationSource?.canNavigate ?? true
  const numSlides = canNavigateSlides ? initialSlides.length : Math.max(initialSlides.length, 1)
  const activeSlideIndex = canNavigateSlides ? Math.min(state.current_slide_index, Math.max(numSlides - 1, 0)) : 0

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetings/public/state?token=${encodeURIComponent(token)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.state) setState(data.state)
        setConnected(true)
      }
    } catch (_e) {
      setConnected(false)
    }
  }, [token])

  useEffect(() => {
    const t = setInterval(poll, POLL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [poll])

  useEffect(() => {
    const channel = createMeetingLiveChannel(initialMeeting.id, (payload) => {
      setSharedScreen(payload.active ? payload : null)
    })

    return () => {
      void channel.unsubscribe()
    }
  }, [initialMeeting.id])

  const updateSlideIndex = async (index: number) => {
    if (!state.allow_client_navigation || !canNavigateSlides) return
    setState((s) => ({ ...s, current_slide_index: index }))
    try {
      await fetch(`/api/meetings/public/state?token=${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_slide_index: index }),
      })
    } catch (_e) {}
  }

  const goPrev = () => {
    if (!state.allow_client_navigation || !canNavigateSlides || activeSlideIndex <= 0) return
    const next = activeSlideIndex - 1
    updateSlideIndex(next)
  }
  const goNext = () => {
    if (!state.allow_client_navigation || !canNavigateSlides || activeSlideIndex >= numSlides - 1) return
    const next = activeSlideIndex + 1
    updateSlideIndex(next)
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
      if (!state.allow_client_navigation || !canNavigateSlides || sharedScreen?.active || numSlides <= 1) return

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
  }, [state.allow_client_navigation, canNavigateSlides, sharedScreen?.active, activeSlideIndex, numSlides])

  return (
    <div className="flex h-full flex-col bg-[#09111f]">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Presentation</p>
          <h1 className="truncate text-lg font-semibold text-white">{initialMeeting.title}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/65">
          {connected ? (
            <span className="flex items-center gap-1">
              <Wifi className="h-4 w-4 text-green-400" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <WifiOff className="h-4 w-4" />
              Reconnecting
            </span>
          )}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col p-4">
        <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_18px_50px_rgba(0,0,0,0.28)] min-h-[400px]">
          {sharedScreen?.active && sharedScreen.frame ? (
            <div className="flex h-full min-h-[400px] items-center justify-center overflow-hidden bg-black/30">
              <img
                src={sharedScreen.frame}
                alt={sharedScreen.sourceLabel ?? "Shared presentation"}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <SlideViewer
              presentationSource={presentationSource}
              pageIndex={activeSlideIndex}
              className="h-full min-h-[400px]"
            />
          )}
          {(state.show_host_camera ?? true) && state.host_camera_frame && (
            <div className="absolute bottom-4 right-4 w-48 overflow-hidden rounded-2xl border border-white/15 bg-black/70 shadow-2xl backdrop-blur">
              <img
                src={state.host_camera_frame}
                alt="Presenter camera"
                className="h-28 w-full object-cover"
              />
              <div className="px-3 py-2 text-xs text-white/65">Presenter</div>
            </div>
          )}
        </div>
        {!sharedScreen?.active && state.allow_client_navigation && canNavigateSlides && numSlides > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={activeSlideIndex <= 0}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white disabled:opacity-50 hover:bg-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-20 text-center text-sm text-white/75">
              {activeSlideIndex + 1} / {numSlides}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={activeSlideIndex >= numSlides - 1}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white disabled:opacity-50 hover:bg-white/10"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
        {!sharedScreen?.active && !canNavigateSlides && (
          <p className="mt-4 text-center text-xs text-white/45">
            Shared presentation source
          </p>
        )}
        {sharedScreen?.active && (
          <p className="mt-4 text-center text-xs text-white/45">
            Live shared presentation
          </p>
        )}
      </main>
    </div>
  )
}
