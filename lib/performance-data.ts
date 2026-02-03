export interface PerformanceMetric {
  id: string
  name: string
  value: number
  target: number
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  trend: "up" | "down" | "stable"
  trendPercentage: number
  category: "sales" | "activity" | "recruiting" | "retention"
}

export interface ChartDataPoint {
  date: string
  value: number
  target?: number
}

export const mockMetrics: PerformanceMetric[] = []

export const mockChartData: Record<string, ChartDataPoint[]> = {}

export const activityData: Array<{ date: string; calls: number; emails: number; appointments: number; presentations: number }> = []
