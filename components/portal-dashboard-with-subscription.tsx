"use client"

import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { PortalLayout } from "@/components/portal-layout"
import {
  PipelineCard,
  FollowUpsCard,
  AppointmentsCard,
  RecentContactsCard,
  QuickLinksCard,
} from "@/components/dashboard-cards"
import { SubscriptionModal } from "@/components/subscription-modal"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/contexts/sidebar-context"

export function PortalDashboardWithSubscription() {
  const [showSubscription, setShowSubscription] = useState(false)
  const { isCollapsed, toggleSidebar } = useSidebar()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      setShowSubscription(params.get("show_subscription") === "1")
    }
  }, [])

  return (
    <>
      <PortalLayout>
        <div className="space-y-8">
          <div className="space-y-1">
            <div className="flex min-w-0 items-center gap-3">
              {isCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="hidden lg:inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Expand sidebar"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening with your clients.
            </p>
          </div>
          <div className="grid gap-6">
            <PipelineCard />
            <div className="grid lg:grid-cols-2 gap-6">
              <FollowUpsCard />
              <AppointmentsCard />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <RecentContactsCard />
              <QuickLinksCard />
            </div>
          </div>
        </div>
      </PortalLayout>
      <SubscriptionModal open={showSubscription} onOpenChange={setShowSubscription} />
    </>
  )
}
