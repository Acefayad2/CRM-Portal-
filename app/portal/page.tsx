import { Suspense } from "react"
import { PortalDashboardWithSubscription } from "@/components/portal-dashboard-with-subscription"

export const dynamic = "force-dynamic"

export default function PortalDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <PortalDashboardWithSubscription />
    </Suspense>
  )
}
