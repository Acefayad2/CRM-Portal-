"use client"

import { useEffect, useMemo, useState } from "react"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PerformanceMetricCard } from "@/components/performance-metric-card"
import { PerformanceCharts } from "@/components/performance-charts"
import { useClients } from "@/contexts/clients-context"
import { useContactLogs } from "@/contexts/contact-logs-context"
import { buildChartData, buildPerformanceMetrics, type CalendarEventSummary } from "@/lib/portal-insights"
import { TrendingUp, Target, Users, DollarSign, Calendar, Download, Settings } from "lucide-react"

export default function PerformancePage() {
  const { clients, isLoading: clientsLoading } = useClients()
  const { recentContacts, getClientContactHistory } = useContactLogs()
  const [events, setEvents] = useState<CalendarEventSummary[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/calendar/events")
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (cancelled) return
        if (ok && Array.isArray(data?.events)) {
          setEvents(data.events)
          return
        }
        setEvents([])
      })
      .catch(() => {
        if (!cancelled) setEvents([])
      })
      .finally(() => {
        if (!cancelled) setEventsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const allLogs = useMemo(() => {
    const entries = clients.flatMap((client) => getClientContactHistory(client.id))
    if (entries.length > 0) return entries
    return recentContacts
  }, [clients, getClientContactHistory, recentContacts])

  const metrics = useMemo(() => buildPerformanceMetrics(clients, allLogs, events), [clients, allLogs, events])
  const { chartData, activityData, comparisonData } = useMemo(
    () => buildChartData(clients, allLogs, events),
    [clients, allLogs, events]
  )

  const activityMetrics = metrics.filter((m) => m.category === "activity")
  const salesMetrics = metrics.filter((m) => m.category === "sales")
  const retentionMetrics = metrics.filter((m) => m.category === "retention")

  const totalTarget = metrics.reduce((sum, metric) => sum + metric.target, 0)
  const totalActual = metrics.reduce((sum, metric) => sum + metric.value, 0)
  const overallProgress = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0
  const monthlyAppointments = metrics.find((metric) => metric.id === "appointments-set")?.value ?? 0
  const activePipeline = metrics.find((metric) => metric.id === "active-pipeline")?.value ?? 0
  const closeRate = metrics.find((metric) => metric.id === "close-rate")?.value ?? 0
  const loading = clientsLoading || eventsLoading

  return (
    <PortalLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Performance Analytics</h1>
            <p className="text-muted-foreground">Track CRM activity, appointments, and close-rate trends across the portal</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button variant="outline" className="flex w-full items-center justify-center gap-2 bg-transparent sm:w-auto">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="flex w-full items-center justify-center gap-2 bg-transparent sm:w-auto">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallProgress}%</div>
              <p className="text-xs text-muted-foreground">of current tracked targets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyAppointments}</div>
              <p className="text-xs text-muted-foreground">appointments scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Close Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{closeRate}%</div>
              <p className="text-xs text-muted-foreground">won opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Pipeline</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePipeline}</div>
              <p className="text-xs text-muted-foreground">clients still in play</p>
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
            {loading ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">Loading performance data...</CardContent>
              </Card>
            ) : (
              <>
                {salesMetrics.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Sales Metrics</h2>
                      <Badge variant="outline">{salesMetrics.length} metrics</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {salesMetrics.map((metric) => (
                        <PerformanceMetricCard key={metric.id} metric={metric} />
                      ))}
                    </div>
                  </div>
                )}

                {activityMetrics.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
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

                {retentionMetrics.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Retention Metrics</h2>
                      <Badge variant="outline">{retentionMetrics.length} metrics</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {retentionMetrics.map((metric) => (
                        <PerformanceMetricCard key={metric.id} metric={metric} />
                      ))}
                    </div>
                  </div>
                )}

                {metrics.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 text-lg font-medium">No activity yet</h3>
                      <p className="text-muted-foreground">Add clients, log touches, or create meetings to populate analytics.</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="charts">
            <PerformanceCharts chartData={chartData} activityData={activityData} comparisonData={comparisonData} />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Goal Tracking Snapshot</CardTitle>
                <CardDescription>Current system-generated targets based on your recent activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {metric.value} of {metric.target} this {metric.period}
                      </p>
                    </div>
                    <Badge variant={metric.value >= metric.target ? "default" : "outline"}>
                      {Math.round((metric.value / metric.target) * 100) || 0}% complete
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  )
}
