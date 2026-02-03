"use client"

import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PerformanceMetricCard } from "@/components/performance-metric-card"
import { PerformanceCharts } from "@/components/performance-charts"
import { TrendingUp, Target, Users, DollarSign, Phone, Calendar, Download, Settings } from "lucide-react"
import { mockMetrics } from "@/lib/performance-data"

export default function PerformancePage() {
  const activityMetrics = mockMetrics.filter((m) => m.category === "activity")
  const recruitingMetrics = mockMetrics.filter((m) => m.category === "recruiting")
  const retentionMetrics = mockMetrics.filter((m) => m.category === "retention")

  const totalTarget = mockMetrics.reduce((sum, m) => sum + m.target, 0)
  const totalActual = mockMetrics.reduce((sum, m) => sum + m.value, 0)
  const overallProgress = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0

  return (
    <PortalLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Performance Analytics</h1>
            <p className="text-muted-foreground">Track your KPIs, goals, and business metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Overall Performance Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallProgress}%</div>
              <p className="text-xs text-muted-foreground">of all targets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">apps submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground">premium volume</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Growth</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">team members</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            <TabsTrigger value="charts">Charts & Trends</TabsTrigger>
            <TabsTrigger value="goals">Goal Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-6">
            {/* Activity Metrics */}
            {activityMetrics.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Activity Metrics</h2>
                  <Badge variant="outline">{activityMetrics.length} metrics</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {activityMetrics.map((metric) => (
                    <PerformanceMetricCard key={metric.id} metric={metric} />
                  ))}
                </div>
              </div>
            )}

            {/* Recruiting & Retention */}
            {(recruitingMetrics.length > 0 || retentionMetrics.length > 0) && (
              <div className="grid gap-6 md:grid-cols-2">
                {recruitingMetrics.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Recruiting</h2>
                      <Badge variant="outline">{recruitingMetrics.length} metrics</Badge>
                    </div>
                    <div className="space-y-4">
                      {recruitingMetrics.map((metric) => (
                        <PerformanceMetricCard key={metric.id} metric={metric} />
                      ))}
                    </div>
                  </div>
                )}

                {retentionMetrics.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Retention</h2>
                      <Badge variant="outline">{retentionMetrics.length} metric</Badge>
                    </div>
                    <div className="space-y-4">
                      {retentionMetrics.map((metric) => (
                        <PerformanceMetricCard key={metric.id} metric={metric} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activityMetrics.length === 0 && recruitingMetrics.length === 0 && retentionMetrics.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Metrics Added</h3>
                <p className="text-muted-foreground">Add performance metrics to track your KPIs and goals</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="charts">
            <PerformanceCharts />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Goal Setting & Tracking</CardTitle>
                <CardDescription>Set and monitor your performance goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Goal Management</h3>
                    <p className="text-muted-foreground mb-4">
                      Set monthly, quarterly, and yearly goals to track your progress
                    </p>
                    <Button>Set New Goals</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  )
}
