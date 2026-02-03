import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <PortalLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and configurations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Account Settings
            </CardTitle>
            <CardDescription>Profile, notifications, and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section will include profile management, notification settings, calendar integrations, and system
              preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
