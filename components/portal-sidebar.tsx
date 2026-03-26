"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Users,
  UsersRound,
  FileText,
  BookOpen,
  Settings,
  Menu,
  X,
  MessageSquare,
  CreditCard,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
  Video,
} from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { getUserInitials } from "@/lib/avatar-initials"

const baseNavigation = [
  { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { name: "Presentations", href: "/portal/meetings", icon: Video },
  { name: "Calendars", href: "/portal/calendars", icon: Calendar },
  { name: "Clients", href: "/portal/clients", icon: Users },
  { name: "Team", href: "/portal/team", icon: UsersRound },
  { name: "Scripts", href: "/portal/scripts", icon: FileText },
  { name: "Resources", href: "/portal/resources", icon: BookOpen },
  { name: "Test SMS", href: "/test-sms", icon: MessageSquare },
  { name: "Billing", href: "/portal/settings/billing", icon: CreditCard },
  { name: "Settings", href: "/portal/settings", icon: Settings },
]
const adminNavItem = { name: "Admin", href: "/portal/admin", icon: ShieldCheck }

export function PortalSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userProfile, setUserProfile] = useState<{ firstName?: string; lastName?: string; email?: string } | null>(null)
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar } = useSidebar()

  useEffect(() => {
    fetch("/api/workspaces/members")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setIsAdmin(data.currentUserRole === "admin"))
      .catch(() => setIsAdmin(false))
  }, [])

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUserProfile(data ? { firstName: data.firstName, lastName: data.lastName, email: data.email } : null))
      .catch(() => setUserProfile(null))
  }, [])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isMobileMenuOpen])

  const navigation = isAdmin ? [adminNavItem, ...baseNavigation] : baseNavigation

  const NavLink = ({ item }: { item: (typeof baseNavigation)[0] | typeof adminNavItem }) => {
    const isActive = pathname === item.href
    const link = (
      <Link
        href={item.href}
        onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          "flex items-center rounded-lg text-sm font-medium transition-colors",
          isCollapsed ? "justify-center p-3" : "space-x-3 px-3 py-2",
          isActive
            ? "bg-white/10 text-white"
            : "text-sidebar-foreground hover:bg-white/5 hover:text-white",
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span>{item.name}</span>}
      </Link>
    )
    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="border-white/20 bg-black/80">
            {item.name}
          </TooltipContent>
        </Tooltip>
      )
    }
    return link
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-[60]">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-11 w-11 shrink-0 rounded-xl border-white/20 bg-slate-950/90 text-white backdrop-blur-md hover:bg-slate-900"
          aria-expanded={isMobileMenuOpen}
          aria-controls="portal-mobile-nav"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        id="portal-mobile-nav"
        data-calendar-sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-50 max-h-[100dvh] border-r border-sidebar-border bg-sidebar/85 backdrop-blur-xl transform transition-all duration-200 ease-in-out lg:translate-x-0",
          "overflow-y-auto overscroll-contain shadow-2xl lg:shadow-none",
          isCollapsed ? "w-16" : "w-56",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={cn(
              "flex border-b border-sidebar-border",
              isCollapsed ? "justify-center p-3" : "justify-between p-6",
            )}
          >
            {!isCollapsed ? (
              <Link href="/portal" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-sidebar-primary">Pantheon</span>
              </Link>
            ) : (
              <Link href="/portal" className="flex justify-center">
                <span className="text-xl font-bold text-sidebar-primary">P</span>
              </Link>
            )}
            {/* Collapse toggle - desktop only (three-line menu icon) */}
            <div className="hidden lg:flex items-center">
              {!isCollapsed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSidebar}
                      className="h-8 w-8 text-sidebar-foreground hover:text-white hover:bg-white/5"
                    >
                      <Menu className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="border-white/20 bg-black/80">
                    Collapse sidebar
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* User info - hide when collapsed */}
          {!isCollapsed && (
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center space-x-3">
                <Link href="/portal/settings" className="shrink-0">
                  <Avatar className="cursor-pointer hover:ring-2 hover:ring-sidebar-primary/60 hover:ring-offset-2 hover:ring-offset-sidebar bg-sidebar-accent text-sidebar-accent-foreground">
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                      {userProfile
                        ? getUserInitials(userProfile.firstName, userProfile.lastName, userProfile.email)
                        : "…"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {userProfile
                      ? [userProfile.firstName, userProfile.lastName].filter(Boolean).join(" ") || userProfile.email || "Account"
                      : ""}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {userProfile?.email ?? ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item as (typeof baseNavigation)[0]} />
            ))}
          </nav>

          {/* Collapse toggle when collapsed - expand button */}
          {isCollapsed && (
            <div className="p-3 border-t border-sidebar-border">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="w-full h-10 text-sidebar-foreground hover:text-white hover:bg-white/5"
                  >
                    <PanelLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="border-white/20 bg-black/80">
                  Expand sidebar
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </TooltipProvider>
  )
}
