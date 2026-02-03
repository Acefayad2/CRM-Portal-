import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default function ResourcesPage() {
  return (
    <PortalLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resources</h1>
          <p className="text-muted-foreground">Training materials, documents, and helpful resources</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Resource Library
            </CardTitle>
            <CardDescription>Training materials and documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This section will include training videos, product guides, compliance documents, and marketing materials.
            </p>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
