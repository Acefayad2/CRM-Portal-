"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"

const navigation = [
  { name: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { name: "Calendars", href: "/portal/calendars", icon: Calendar },
  { name: "Clients", href: "/portal/clients", icon: Users },
  { name: "Team", href: "/portal/team", icon: UsersRound },
  { name: "Scripts", href: "/portal/scripts", icon: FileText },
  { name: "Resources", href: "/portal/resources", icon: BookOpen },
  { name: "Test SMS", href: "/test-sms", icon: MessageSquare },
  { name: "Billing", href: "/portal/settings/billing", icon: CreditCard },
  { name: "Settings", href: "/portal/settings", icon: Settings },
]

export function PortalSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isCollapsed, toggleSidebar } = useSidebar()

  const NavLink = ({ item }: { item: (typeof navigation)[0] }) => {
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
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/95 backdrop-blur"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        data-calendar-sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-sidebar border-r border-sidebar-border transform transition-all duration-200 ease-in-out lg:translate-x-0",
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
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground" />
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate"></p>
                  <p className="text-xs text-sidebar-foreground/60 truncate"></p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
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
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </TooltipProvider>
  )
}
