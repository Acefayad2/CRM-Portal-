"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { mockChartData, activityData } from "@/lib/performance-data"

export function PerformanceCharts() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="activity">Daily Activity</TabsTrigger>
          <TabsTrigger value="comparison">Goal Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          {Object.keys(mockChartData).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No chart data available. Add metrics to see trends.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {mockChartData["apps-submitted"] && mockChartData["apps-submitted"].length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Apps Submitted</CardTitle>
                      <CardDescription>Monthly applications submitted vs target</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={mockChartData["apps-submitted"]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Actual" />
                          <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" name="Target" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {mockChartData["premium-volume"] && mockChartData["premium-volume"].length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Premium Volume</CardTitle>
                    <CardDescription>Monthly premium volume performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={mockChartData["premium-volume"]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.3}
                          name="Premium Volume"
                        />
                        <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" name="Target" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {mockChartData["close-rate"] && mockChartData["close-rate"].length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Close Rate Trend</CardTitle>
                    <CardDescription>Monthly close rate percentage over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={mockChartData["close-rate"]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, "Close Rate"]} />
                        <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity Overview</CardTitle>
              <CardDescription>Track your daily sales activities</CardDescription>
            </CardHeader>
            <CardContent>
              {activityData.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No activity data available. Log activities to see trends.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calls" fill="#3b82f6" name="Calls" />
                    <Bar dataKey="emails" fill="#10b981" name="Emails" />
                    <Bar dataKey="appointments" fill="#f59e0b" name="Appointments" />
                    <Bar dataKey="presentations" fill="#ef4444" name="Presentations" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Goal Achievement Comparison</CardTitle>
              <CardDescription>Current performance vs targets across all metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {activityData.length === 0 && Object.keys(mockChartData).length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No data available for comparison. Add metrics to see comparisons.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                    <Bar dataKey="target" fill="#ef4444" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
