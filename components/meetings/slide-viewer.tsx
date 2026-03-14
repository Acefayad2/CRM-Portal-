"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink } from "lucide-react"
import { ensurePdfJsConfig } from "@/lib/pdfjs-config"
import type { PresentationSource } from "@/lib/presentation-source"

type SlideViewerProps = {
  presentationSource: PresentationSource | null
  pageIndex: number
  className?: string
}

export function SlideViewer({ presentationSource, pageIndex, className = "" }: SlideViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfUrl = presentationSource?.kind === "pdf" ? presentationSource.url : null

  useEffect(() => {
    if (!pdfUrl) {
      setNumPages(0)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    let cancelled = false
    const load = async () => {
      try {
        await ensurePdfJsConfig()
        const pdfjsLib = await import("pdfjs-dist")
        const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise
        if (cancelled) return
        setNumPages(pdf.numPages)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load PDF")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [pdfUrl])

  useEffect(() => {
    if (!pdfUrl || !canvasRef.current || numPages === 0) return
    const pageNum = Math.min(Math.max(0, pageIndex), numPages - 1) + 1
    let cancelled = false
    const render = async () => {
      try {
        await ensurePdfJsConfig()
        const pdfjsLib = await import("pdfjs-dist")
        const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise
        if (cancelled) return
        const page = await pdf.getPage(pageNum)
        if (cancelled) return
        const canvas = canvasRef.current
        if (!canvas) return
        const scale = Math.min(2, (canvas.parentElement?.clientWidth ?? 800) / page.getViewport({ scale: 1 }).width)
        const viewport = page.getViewport({ scale })
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext("2d")
        if (ctx) await page.render({ canvasContext: ctx, viewport }).promise
      } catch {
        // ignore render errors after initial load
      }
    }
    void render()
    return () => {
      cancelled = true
    }
  }, [pdfUrl, pageIndex, numPages])

  if (!presentationSource?.url && !presentationSource?.embedUrl) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-black/30 ${className}`}>
        <p className="text-white/60">No deck selected</p>
      </div>
    )
  }

  if (presentationSource.kind === "embed" && presentationSource.embedUrl) {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-black/30 ${className}`}>
        <iframe
          src={presentationSource.embedUrl}
          title={presentationSource.label}
          className="h-full min-h-[320px] w-full border-0 bg-white"
          allow="autoplay; clipboard-read; clipboard-write; fullscreen"
          allowFullScreen
        />
        {presentationSource.url && (
          <a
            href={presentationSource.url}
            target="_blank"
            rel="noreferrer"
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs text-white hover:bg-black/80"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open source
          </a>
        )}
      </div>
    )
  }

  if (presentationSource.kind === "link") {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 rounded-lg bg-black/30 p-6 text-center ${className}`}>
        <div>
          <p className="text-lg font-medium text-white">{presentationSource.label}</p>
          <p className="mt-2 text-sm text-white/60">
            This source opens in a separate tab because it cannot be embedded directly.
          </p>
        </div>
        {presentationSource.url && (
          <a
            href={presentationSource.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
          >
            <ExternalLink className="h-4 w-4" />
            Open presentation
          </a>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-black/30 ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    )
  }
  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-black/30 ${className}`}>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }
  if (numPages === 0) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-black/30 ${className}`}>
        <p className="text-white/60">No pages</p>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center overflow-auto rounded-lg bg-black/30 p-4 ${className}`}>
      <canvas ref={canvasRef} className="h-auto max-w-full shadow-lg" />
    </div>
  )
}
