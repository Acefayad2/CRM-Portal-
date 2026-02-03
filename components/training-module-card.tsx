"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Clock, CheckCircle2, BookOpen, Calculator, Calendar } from "lucide-react"
import type { TrainingModule } from "@/lib/training-modules-data"

interface TrainingModuleCardProps {
  module: TrainingModule
  onStart: (module: TrainingModule) => void
  onView: (module: TrainingModule) => void
}

export function TrainingModuleCard({ module, onStart, onView }: TrainingModuleCardProps) {
  const categoryConfig = {
    licensing: {
      icon: BookOpen,
      color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      badgeColor: "bg-blue-500/20 text-blue-300",
    },
    cft: {
      icon: Calculator,
      color: "bg-green-500/20 text-green-300 border-green-500/30",
      badgeColor: "bg-green-500/20 text-green-300",
    },
    appointment: {
      icon: Calendar,
      color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      badgeColor: "bg-purple-500/20 text-purple-300",
    },
  }

  const config = categoryConfig[module.category]
  const Icon = config.icon

  return (
    <Card className="hover:shadow-lg transition-all border-white/20 bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-3 rounded-lg ${config.color} border`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg text-white">{module.title}</CardTitle>
              <CardDescription className="text-white/70">{module.description}</CardDescription>
            </div>
          </div>
          {module.completed && (
            <Badge className={`${config.badgeColor} border-0`}>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center gap-4 text-sm text-white/70">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{module.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{module.lessons.length} lessons</span>
          </div>
        </div>

        {module.progress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Progress</span>
              <span className="text-white font-medium">{module.progress}%</span>
            </div>
            <Progress value={module.progress} className="h-2 bg-white/10" />
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {module.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs border-white/20 text-white/70">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
          {module.progress === 0 ? (
            <Button
              onClick={() => onStart(module)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Training
            </Button>
          ) : module.completed ? (
            <Button
              onClick={() => onView(module)}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Review Module
            </Button>
          ) : (
            <>
              <Button
                onClick={() => onView(module)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Continue
              </Button>
              <Button
                onClick={() => onView(module)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                View
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
