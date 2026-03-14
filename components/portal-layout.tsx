"use client"

import { useEffect, useState } from "react"
import type React from "react"
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
    <div className="portal-shell relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-50">
      <div className={`fixed left-0 top-0 z-50 portal-sidebar-wrapper ${sidebarWidth} h-screen pointer-events-none transition-all duration-300 ease-in-out`}>
        <div className="portal-sidebar-surface pointer-events-auto h-full w-full border-r border-slate-800/80 bg-slate-900">
          <PortalSidebar />
        </div>
      </div>

      <div
        className={`portal-main-surface relative z-10 min-h-screen lg:transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pl-16" : "lg:pl-56"}`}
      >
        <main
          key={pathname}
          className={`min-h-screen p-6 lg:p-8 transition-opacity duration-300 ${isLoaded ? "animate-fade-in opacity-100" : "opacity-0"}`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
