"use client"

import type React from "react"
import Image from "next/image"
import { PortalSidebar } from "@/components/portal-sidebar"

interface PortalLayoutProps {
  children: React.ReactNode
}

export function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image - covers entire page including sidebar area */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Portal Sidebar - Static overlay with matching background */}
      <div className="fixed left-0 top-0 z-50 portal-sidebar-wrapper">
        <div className="relative w-64 h-screen">
          {/* Background image overlay for sidebar */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          {/* Sidebar with transparent backdrop blur */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-md border-r border-white/20">
            <PortalSidebar />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 relative z-10">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
