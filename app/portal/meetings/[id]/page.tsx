"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { PortalLayout } from "@/components/portal-layout"
import { HostMeetingRoom } from "@/components/meetings/host-meeting-room"

type Meeting = {
  id: string
  title: string
  status: string
  deck_id: string | null
}
type Deck = { id: string; title: string } | null
type Slide = { id: string; slide_index: number; storage_path: string; speaker_notes: string | null }
type State = { current_slide_index: number; allow_client_navigation: boolean }

export default function HostMeetingPage() {
  const params = useParams()
  const meetingId = typeof params.id === "string" ? params.id : ""
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [deck, setDeck] = useState<Deck>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [state, setState] = useState<State>({ current_slide_index: 0, allow_client_navigation: false })
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [decks, setDecks] = useState<{ id: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDeck = useCallback(async (deckId: string) => {
    const [deckRes, urlRes] = await Promise.all([
      fetch(`/api/decks/${deckId}`),
      fetch(`/api/decks/${deckId}/pdf-url`),
    ])
    if (deckRes.ok) {
      const { deck: d, slides: s } = await deckRes.json()
      setDeck(d)
      setSlides(s ?? [])
    }
    if (urlRes.ok) {
      const { url } = await urlRes.json()
      setPdfUrl(url)
    }
  }, [])

  useEffect(() => {
    if (!meetingId) return
    let cancelled = false
    const load = async () => {
      try {
        const [meetingRes, stateRes, decksRes] = await Promise.all([
          fetch(`/api/meetings/${meetingId}`),
          fetch(`/api/meetings/${meetingId}/state`),
          fetch("/api/decks"),
        ])
        if (cancelled) return
        if (!meetingRes.ok) {
          setError(meetingRes.status === 404 ? "Presentation not found" : "Failed to load")
          return
        }
        const meetingData = await meetingRes.json()
        setMeeting(meetingData)
        const stateData = stateRes.ok ? await stateRes.json() : {}
        setState({
          current_slide_index: stateData.current_slide_index ?? 0,
          allow_client_navigation: stateData.allow_client_navigation ?? false,
        })
        const decksData = await decksRes.json().catch(() => ({}))
        setDecks(Array.isArray(decksData.decks) ? decksData.decks : [])
        if (meetingData.deck_id) {
          loadDeck(meetingData.deck_id)
        }
      } catch (_e) {
        if (!cancelled) setError("Failed to load")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [meetingId, loadDeck])

  const handleSelectDeck = async (deckId: string) => {
    if (!meeting) return
    try {
      await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deck_id: deckId }),
      })
      setMeeting((m) => (m ? { ...m, deck_id: deckId } : null))
      await loadDeck(deckId)
    } catch (_e) {}
  }

  const handleUploadPdf = async (deckId: string, file: File) => {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch(`/api/decks/${deckId}/upload`, { method: "POST", body: form })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error ?? "Upload failed")
    }
    await loadDeck(deckId)
  }

  const handleCreateDeck = async () => {
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Deck" }),
      })
      const data = await res.json()
      if (data.deck) {
        setDecks((prev) => [data.deck, ...prev])
        await handleSelectDeck(data.deck.id)
      }
    } catch (_e) {}
  }

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      </PortalLayout>
    )
  }
  if (error || !meeting) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-red-400">
          {error ?? "Meeting not found"}
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      <div className="h-[calc(100vh-2rem)] rounded-lg overflow-hidden border border-white/20 bg-black/40">
        <HostMeetingRoom
          meetingId={meetingId}
          meeting={meeting}
          deck={deck}
          slides={slides}
          initialState={state}
          pdfUrl={pdfUrl}
          decks={decks}
          onSelectDeck={handleSelectDeck}
          onUploadPdf={handleUploadPdf}
          onCreateDeck={handleCreateDeck}
        />
      </div>
    </PortalLayout>
  )
}
