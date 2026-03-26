"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { PortalSidebar } from "@/components/portal-sidebar"
import { BeamsBackground } from "@/components/ui/beams-background"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

interface PortalLayoutProps {
  children: React.ReactNode
}

export function PortalLayout({ children }: PortalLayoutProps) {
  const pathname = usePathname()
  const { isCollapsed } = useSidebar()

  const sidebarWidthClass = isCollapsed ? "lg:w-16" : "lg:w-56"

  return (
    <BeamsBackground intensity="medium" className="portal-shell text-slate-50">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.3))]" />

      <div
        className={cn(
          "fixed left-0 top-0 z-50 portal-sidebar-wrapper h-screen pointer-events-none transition-all duration-300 ease-in-out",
          "max-lg:w-0 max-lg:overflow-visible",
          sidebarWidthClass,
        )}
      >
        <div className="portal-sidebar-surface pointer-events-auto h-full w-full border-r border-white/10 bg-slate-950/58 backdrop-blur-xl max-lg:border-0 max-lg:bg-transparent max-lg:backdrop-blur-none">
          <PortalSidebar />
        </div>
      </div>

      <div
        className={`portal-main-surface relative z-10 min-h-screen min-h-[100dvh] lg:transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pl-16" : "lg:pl-56"}`}
      >
        <main
          key={pathname}
          className={cn(
            "min-h-screen min-h-[100dvh]",
            "px-4 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-[max(4.5rem,env(safe-area-inset-top,0px))] sm:px-6",
            "lg:p-8 lg:pt-8",
          )}
        >
          {children}
        </main>
      </div>
    </BeamsBackground>
  )
}
