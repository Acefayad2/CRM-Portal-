"use client"

import Image from "next/image"
import type { ReactNode } from "react"
import { SiteFooter } from "@/components/site-footer"

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
        <div className="flex min-h-full min-w-full flex-col p-4">
          <div className="flex flex-1 items-center justify-center py-8">{children}</div>
          <SiteFooter variant="auth" className="pb-6" />
        </div>
      </div>
    </div>
  )
}
