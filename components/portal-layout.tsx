"use client"

import { useEffect, useState } from "react"
import type React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { PortalSidebar } from "@/components/portal-sidebar"
import { useSidebar } from "@/contexts/sidebar-context"

interface PortalLayoutProps {
  children: React.ReactNode
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const pathname = usePathname()
  const [isLoaded, setIsLoaded] = useState(false)
  const { isCollapsed } = useSidebar()

  useEffect(() => {
    setIsLoaded(false)
    const timer = setTimeout(() => setIsLoaded(true), 50)
    return () => clearTimeout(timer)
  }, [pathname])

  const sidebarWidth = isCollapsed ? "w-16" : "w-56"

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image - covers entire page including sidebar area */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover -z-10"
        priority
      />

      {/* Portal Sidebar - collapsible, transparent overlay */}
      <div className={`fixed left-0 top-0 z-50 portal-sidebar-wrapper ${sidebarWidth} h-screen pointer-events-none transition-all duration-300 ease-in-out`}>
        <div className="pointer-events-auto w-full h-full border-r border-white/20">
          <PortalSidebar />
        </div>
      </div>

      {/* Main Content - adjusts padding when sidebar collapses */}
      <div className={`lg:transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pl-16" : "lg:pl-56"} relative z-10`}>
        <main
          key={pathname}
          className={`p-6 lg:p-8 transition-opacity duration-300 ${isLoaded ? "animate-fade-in opacity-100" : "opacity-0"}`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
