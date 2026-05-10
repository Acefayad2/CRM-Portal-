"use client"

import { ExternalLink } from "lucide-react"
import type { PresentationSource } from "@/lib/presentation-source"

type SlideViewerProps = {
  presentationSource: PresentationSource | null
  pageIndex: number
  className?: string
}

export function SlideViewer({ presentationSource, pageIndex, className = "" }: SlideViewerProps) {
  const pdfUrl = presentationSource?.kind === "pdf" ? presentationSource.url : null
  const pageNumber = Math.max(1, pageIndex + 1)
  const embedUrl = presentationSource?.kind === "embed" ? presentationSource.embedUrl : null
  const unsupportedEmbed = !!embedUrl && (embedUrl.includes("view.officeapps.live.com") || embedUrl.includes("onedrive.live.com"))

  if (!presentationSource?.url && !presentationSource?.embedUrl) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-black/30 ${className}`}>
        <p className="text-white/60">No deck selected</p>
      </div>
    )
  }

  if (presentationSource.kind === "embed" && presentationSource.embedUrl && !unsupportedEmbed) {
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

  if (presentationSource.kind === "embed" && presentationSource.url) {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 rounded-lg bg-black/30 p-6 text-center ${className}`}>
        <div>
          <p className="text-lg font-medium text-white">Preview unavailable in-app</p>
          <p className="mt-2 text-sm text-white/60">Open this presentation in a new window for the most reliable view.</p>
        </div>
        <a
          href={presentationSource.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          <ExternalLink className="h-4 w-4" />
          Open presentation
        </a>
      </div>
    )
  }

  if (presentationSource.kind === "pdf" && pdfUrl) {
    const pdfViewerUrl = `${pdfUrl}#page=${pageNumber}&zoom=page-fit`
    return (
      <div className={`relative overflow-hidden rounded-lg bg-[#0a0f1a] ${className}`}>
        <iframe
          src={pdfViewerUrl}
          title={presentationSource.label}
          className="h-full min-h-[320px] w-full border-0 bg-white"
          allow="autoplay; clipboard-read; clipboard-write; fullscreen"
          allowFullScreen
        />
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs text-white hover:bg-black/80"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open source
        </a>
      </div>
    )
  }

  if (presentationSource.kind === "link") {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 rounded-lg bg-black/30 p-6 text-center ${className}`}>
        <div>
          <p className="text-lg font-medium text-white">{presentationSource.label}</p>
          <p className="mt-2 text-sm text-white/60">
            {presentationSource.note ?? "This source opens in a separate tab because it cannot be embedded directly."}
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
            Open source
          </a>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center rounded-lg bg-black/30 ${className}`}>
      <p className="text-white/60">Presentation source unavailable</p>
    </div>
  )
}
