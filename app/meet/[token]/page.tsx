"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ClientMeetingRoom } from "@/components/meetings/client-meeting-room"
import type { PresentationSource } from "@/lib/presentation-source"

export default function MeetPage() {
  const params = useParams()
  const token = typeof params.token === "string" ? params.token : ""
  const [data, setData] = useState<{
    meeting: { id: string; title: string; status: string }
    state: {
      current_slide_index: number
      allow_client_navigation: boolean
      host_camera_frame?: string | null
      host_camera_updated_at?: string | null
      show_host_camera?: boolean
    }
    slides: { id: string; slide_index: number; storage_path: string }[]
    presentationSource: PresentationSource | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setError("Invalid link")
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const [stateRes, pdfRes] = await Promise.all([
          fetch(`/api/meetings/public/state?token=${encodeURIComponent(token)}`),
          fetch(`/api/meetings/public/pdf-url?token=${encodeURIComponent(token)}`),
        ])
        if (cancelled) return
        if (!stateRes.ok) {
          const err = await stateRes.json().catch(() => ({}))
          setError(err.error ?? "Invalid or expired link")
          return
        }
        const stateData = await stateRes.json()
        let presentationSource: PresentationSource | null = null
        if (pdfRes.ok) {
          const pdfData = await pdfRes.json()
          presentationSource = pdfData.source ?? (pdfData.url ? { kind: "pdf", url: pdfData.url, embedUrl: null, label: "PDF deck", canNavigate: true } : null)
        }
        setData({
          meeting: stateData.meeting,
          state: stateData.state ?? { current_slide_index: 0, allow_client_navigation: false, host_camera_frame: null, show_host_camera: true },
          slides: stateData.slides ?? [],
          presentationSource,
        })
      } catch (_e) {
        if (!cancelled) setError("Failed to load")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black">
        <div className="text-center text-white">
          <p className="text-red-400 mb-2">{error ?? "Something went wrong"}</p>
          <p className="text-white/60 text-sm">This invite link may have expired or is invalid.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="h-screen max-w-5xl mx-auto p-4">
        <ClientMeetingRoom
          token={token}
          initialMeeting={data.meeting}
          initialState={data.state}
          initialSlides={data.slides}
          presentationSource={data.presentationSource}
        />
      </div>
    </div>
  )
}
