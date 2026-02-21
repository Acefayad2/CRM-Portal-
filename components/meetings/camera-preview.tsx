"use client"

import { useEffect, useRef, useState } from "react"

export function CameraPreview({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [muted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    setError(null)
    let stream: MediaStream | null = null
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        video.srcObject = stream
      } catch (e) {
        setError(e instanceof Error ? e.message : "Camera unavailable")
      }
    }
    start()
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  if (error) {
    return (
      <div className={`rounded-lg bg-white/10 flex items-center justify-center p-4 ${className}`}>
        <p className="text-white/70 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        muted={muted}
        playsInline
        className="w-full h-full object-cover mirror"
        style={{ transform: "scaleX(-1)" }}
      />
    </div>
  )
}
