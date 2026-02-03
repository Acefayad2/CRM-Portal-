import { PortalLayout } from "@/components/portal-layout"
import {
  PipelineCard,
  FollowUpsCard,
  AppointmentsCard,
  RecentContactsCard,
  QuickLinksCard,
} from "@/components/dashboard-cards"

export default function PortalDashboard() {
  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your clients.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6">
          {/* Pipeline Overview - Full Width */}
          <PipelineCard />

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            <FollowUpsCard />
            <AppointmentsCard />
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-6">
            <RecentContactsCard />
            <QuickLinksCard />
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
