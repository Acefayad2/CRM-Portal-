"use client"

import Image from "next/image"
import type { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex min-h-full min-w-full items-center justify-center p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
