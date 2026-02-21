"use client"

import { useState, useEffect, useCallback } from "react"
import { SlideViewer } from "./slide-viewer"
import { ChevronLeft, ChevronRight, Wifi, WifiOff } from "lucide-react"

type State = { current_slide_index: number; allow_client_navigation: boolean }

const POLL_INTERVAL_MS = 2000

export function ClientMeetingRoom({
  token,
  initialMeeting,
  initialState,
  initialSlides,
  pdfUrl,
}: {
  token: string
  initialMeeting: { id: string; title: string; status: string }
  initialState: State
  initialSlides: { id: string; slide_index: number; storage_path: string }[]
  pdfUrl: string | null
}) {
  const [state, setState] = useState(initialState)
  const [connected, setConnected] = useState(true)
  const numSlides = initialSlides.length

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
    if (!state.allow_client_navigation) return
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
    if (!state.allow_client_navigation || state.current_slide_index <= 0) return
    const next = state.current_slide_index - 1
    updateSlideIndex(next)
  }
  const goNext = () => {
    if (!state.allow_client_navigation || state.current_slide_index >= numSlides - 1) return
    const next = state.current_slide_index + 1
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
        <SlideViewer
          pdfUrl={pdfUrl}
          pageIndex={state.current_slide_index}
          className="flex-1 min-h-[400px]"
        />
        {state.allow_client_navigation && numSlides > 0 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={state.current_slide_index <= 0}
              className="p-2 rounded-lg bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-white/80 text-sm">
              {state.current_slide_index + 1} / {numSlides}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={state.current_slide_index >= numSlides - 1}
              className="p-2 rounded-lg bg-white/10 text-white disabled:opacity-50 hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
