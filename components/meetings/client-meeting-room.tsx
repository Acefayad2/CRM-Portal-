"use client"

import { useState, useEffect, useCallback } from "react"
import { SlideViewer } from "./slide-viewer"
import { ChevronLeft, ChevronRight, Wifi, WifiOff } from "lucide-react"
import type { PresentationSource } from "@/lib/presentation-source"

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

  return (
    <div className="flex flex-col h-full bg-black/50">
      <header className="flex items-center justify-between p-3 border-b border-white/20">
        <h1 className="text-lg font-semibold text-white truncate">{initialMeeting.title}</h1>
        <div className="flex items-center gap-2 text-sm text-white/70">
          {connected ? (
            <span className="flex items-center gap-1">
              <Wifi className="h-4 w-4 text-green-400" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <WifiOff className="h-4 w-4" />
              Reconnecting...
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 p-4">
        <div className="relative flex-1 min-h-[400px]">
          <SlideViewer
            presentationSource={presentationSource}
            pageIndex={activeSlideIndex}
            className="h-full min-h-[400px]"
          />
          {(state.show_host_camera ?? true) && state.host_camera_frame && (
            <div className="absolute bottom-4 right-4 w-56 overflow-hidden rounded-xl border border-white/20 bg-black/70 shadow-2xl">
              <div className="border-b border-white/10 px-3 py-2 text-xs uppercase tracking-wide text-white/60">
                Presenter
              </div>
              <img
                src={state.host_camera_frame}
                alt="Presenter camera"
                className="h-36 w-full object-cover"
              />
            </div>
          )}
        </div>
        {state.allow_client_navigation && canNavigateSlides && numSlides > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={activeSlideIndex <= 0}
              className="p-2 rounded-lg bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-white/80 text-sm">
              {activeSlideIndex + 1} / {numSlides}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={activeSlideIndex >= numSlides - 1}
              className="p-2 rounded-lg bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
        {!canNavigateSlides && (
          <p className="mt-3 text-center text-xs text-white/50">
            This presentation is being shown as a shared embedded source.
          </p>
        )}
      </main>
    </div>
  )
}
