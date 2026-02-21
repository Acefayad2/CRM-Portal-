"use client"

import { useState, useEffect, useRef } from "react"
import { ensurePdfJsConfig } from "@/lib/pdfjs-config"

type SlideViewerProps = {
  pdfUrl: string | null
  pageIndex: number
  className?: string
}

export function SlideViewer({ pdfUrl, pageIndex, className = "" }: SlideViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!pdfUrl) {
      setNumPages(0)
      setLoading(false)
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
    load()
    return () => { cancelled = true }
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
      } catch (_e) {
        // ignore
      }
    }
    render()
    return () => { cancelled = true }
  }, [pdfUrl, pageIndex, numPages])

  if (!pdfUrl) {
    return (
      <div className={`flex items-center justify-center bg-black/30 rounded-lg ${className}`}>
        <p className="text-white/60">No deck selected</p>
      </div>
    )
  }
  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-black/30 rounded-lg ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    )
  }
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-black/30 rounded-lg ${className}`}>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }
  if (numPages === 0) {
    return (
      <div className={`flex items-center justify-center bg-black/30 rounded-lg ${className}`}>
        <p className="text-white/60">No pages</p>
      </div>
    )
  }

  const safeIndex = Math.min(Math.max(0, pageIndex), numPages - 1)
  return (
    <div className={`flex items-center justify-center overflow-auto bg-black/30 rounded-lg p-4 ${className}`}>
      <canvas ref={canvasRef} className="max-w-full h-auto shadow-lg" />
    </div>
  )
}
