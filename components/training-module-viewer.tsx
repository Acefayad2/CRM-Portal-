"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Play,
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Video,
  FileQuestion,
} from "lucide-react"
import type { TrainingModule, Lesson } from "@/lib/training-modules-data"

interface TrainingModuleViewerProps {
  module: TrainingModule | null
  isOpen: boolean
  onClose: () => void
  onLessonComplete: (moduleId: string, lessonId: string) => void
}

export function TrainingModuleViewer({
  module,
  isOpen,
  onClose,
  onLessonComplete,
}: TrainingModuleViewerProps) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())

  if (!module) return null

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson)
  }

  const handleCompleteLesson = (lessonId: string) => {
    setCompletedLessons(new Set([...completedLessons, lessonId]))
    onLessonComplete(module.id, lessonId)
  }

  const completedCount = completedLessons.size
  const totalLessons = module.lessons.length
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const getLessonIcon = (type: Lesson["type"]) => {
    switch (type) {
      case "video":
        return Video
      case "quiz":
        return FileQuestion
      case "practice":
        return Play
      default:
        return FileText
    }
  }

  const getLessonColor = (type: Lesson["type"]) => {
    switch (type) {
      case "video":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "quiz":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "practice":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white/5 backdrop-blur-lg border-white/20">
        <SheetHeader className="border-b border-white/20 pb-4">
          <SheetTitle className="text-2xl text-white">{module.title}</SheetTitle>
          <SheetDescription className="text-white/70 mt-2">{module.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Progress Section */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Overall Progress</span>
              <span className="text-sm text-white/70">{completedCount} of {totalLessons} lessons</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10" />
            <div className="mt-2 flex items-center gap-4 text-xs text-white/60">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{module.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{totalLessons} lessons</span>
              </div>
            </div>
          </div>

          {/* Lessons List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Lessons</h3>
            {module.lessons.map((lesson, index) => {
              const isCompleted = completedLessons.has(lesson.id)
              const Icon = getLessonIcon(lesson.type)
              const colorClass = getLessonColor(lesson.type)

              return (
                <div
                  key={lesson.id}
                  className={`bg-white/5 rounded-lg p-4 border cursor-pointer transition-all hover:bg-white/10 ${
                    selectedLesson?.id === lesson.id ? "border-white/30 bg-white/10" : "border-white/10"
                  }`}
                  onClick={() => handleLessonClick(lesson)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClass} border flex-shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-white/50">Lesson {index + 1}</span>
                            <Badge variant="outline" className={`text-xs border-0 ${colorClass}`}>
                              {lesson.type}
                            </Badge>
                            {isCompleted && (
                              <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold text-white mb-1">{lesson.title}</h4>
                          <p className="text-sm text-white/70 mb-2">{lesson.description}</p>
                          <div className="flex items-center gap-4 text-xs text-white/60">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{lesson.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedLesson?.id === lesson.id && (
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                          <div className="text-sm text-white/80">{lesson.content}</div>

                          {lesson.resources && lesson.resources.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium text-white">Resources</h5>
                              {lesson.resources.map((resource) => (
                                <a
                                  key={resource.id}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                                >
                                  {resource.type === "pdf" ? (
                                    <Download className="h-4 w-4" />
                                  ) : (
                                    <ExternalLink className="h-4 w-4" />
                                  )}
                                  <span>{resource.title}</span>
                                </a>
                              ))}
                            </div>
                          )}

                          {!isCompleted && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCompleteLesson(lesson.id)
                              }}
                              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
