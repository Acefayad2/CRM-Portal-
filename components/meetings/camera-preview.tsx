"use client"

import { useEffect, useRef, useState } from "react"

export function CameraPreview({
  className = "",
  onFrame,
}: {
  className?: string
  onFrame?: (frame: string) => void
}) {
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

    const captureInterval = window.setInterval(() => {
      if (!onFrame || !video.videoWidth || !video.videoHeight) return
      const canvas = document.createElement("canvas")
      canvas.width = 320
      canvas.height = 180
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
      onFrame(canvas.toDataURL("image/jpeg", 0.55))
    }, 1500)

    return () => {
      window.clearInterval(captureInterval)
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [onFrame])

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
