"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const SIDEBAR_STORAGE_KEY = "portal-sidebar-collapsed"

interface SidebarContextValue {
  isCollapsed: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (stored !== null) {
      setIsCollapsedState(stored === "true")
    }
  }, [mounted])

  const toggleSidebar = useCallback(() => {
    setIsCollapsedState((prev) => {
      const next = !prev
      if (typeof window !== "undefined") {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      }
      return next
    })
  }, [])

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    return {
      isCollapsed: false,
      toggleSidebar: () => {},
    }
  }
  return ctx
}
