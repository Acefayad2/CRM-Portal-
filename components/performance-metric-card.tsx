import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { PerformanceMetric } from "@/lib/performance-data"

interface PerformanceMetricCardProps {
  metric: PerformanceMetric
}

export function PerformanceMetricCard({ metric }: PerformanceMetricCardProps) {
  const progressPercentage = (metric.value / metric.target) * 100
  const isOverTarget = metric.value >= metric.target

  const formatValue = (value: number) => {
    if (metric.name === "Premium Volume") {
      return `$${value.toLocaleString()}`
    }
    if (metric.name.includes("Rate") || metric.name.includes("Retention")) {
      return `${value}%`
    }
    return value.toString()
  }

  const getTrendIcon = () => {
    switch (metric.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = () => {
    switch (metric.trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {metric.period}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{formatValue(metric.value)}</div>
          <div className="text-sm text-muted-foreground">of {formatValue(metric.target)}</div>
        </div>

        <Progress value={Math.min(progressPercentage, 100)} className="h-2" />

        <div className="flex items-center justify-between text-sm">
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {metric.trendPercentage > 0 ? "+" : ""}
              {metric.trendPercentage}%
            </span>
          </div>
          <div className="text-muted-foreground">{Math.round(progressPercentage)}% of target</div>
        </div>
      </CardContent>
    </Card>
  )
}
