"use client"

import { useState } from "react"

type ScriptPanelProps = {
  notes: string | null
  meetingScript?: string
  className?: string
  onHighlightNext?: () => void
  darkMode?: boolean
  fontSize?: number
  onFontSizeChange?: (delta: number) => void
}

export function ScriptPanel({
  notes,
  meetingScript = "",
  className = "",
  darkMode = false,
  fontSize = 16,
  onFontSizeChange,
}: ScriptPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const text = (notes || meetingScript || "").trim() || "No script or speaker notes for this slide."

  return (
    <div className={`flex flex-col rounded-lg border border-white/20 bg-white/5 ${className}`}>
      <div className="flex items-center justify-between p-2 border-b border-white/10">
        <span className="text-sm font-medium text-white/80">Script / Teleprompter</span>
        <div className="flex items-center gap-1">
          {onFontSizeChange && (
            <>
              <button
                type="button"
                onClick={() => onFontSizeChange(-2)}
                className="text-white/70 hover:text-white text-sm px-1"
                aria-label="Decrease font"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => onFontSizeChange(2)}
                className="text-white/70 hover:text-white text-sm px-1"
                aria-label="Increase font"
              >
                A+
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-white/70 hover:text-white text-xs"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>
      {expanded && (
        <div
          className={`flex-1 overflow-auto p-3 text-left whitespace-pre-wrap ${darkMode ? "bg-black/40 text-white" : "text-white/90"}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {text}
        </div>
      )}
    </div>
  )
}
