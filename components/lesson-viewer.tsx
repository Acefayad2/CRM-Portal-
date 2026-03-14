"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, Video, ChevronLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CourseWithOutline, LessonRow, UserLessonProgressRow } from "@/lib/courses-db"

type LessonWithMeta = LessonRow & { course_id: string; module_title: string }

interface LessonViewerProps {
  course: CourseWithOutline
  lesson: LessonWithMeta
  progress: UserLessonProgressRow | null
  courseProgress: UserLessonProgressRow[]
  userId: string | null
}

export function LessonViewer({ course, lesson, progress, courseProgress, userId }: LessonViewerProps) {
  const [completed, setCompleted] = useState(progress?.completed ?? false)
  const [saving, setSaving] = useState(false)
  const progressByLesson = new Map(courseProgress.map((p) => [p.lesson_id, p.completed]))
  progressByLesson.set(lesson.id, completed)

  const handleMarkComplete = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const res = await fetch("/api/courses/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lesson.id, completed: !completed }),
      })
      if (res.ok) setCompleted(!completed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left: Outline sidebar */}
      <aside className="lg:w-72 flex-shrink-0 space-y-4">
        <Link
          href={`/portal/courses/${course.id}`}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to course
        </Link>
        <Card className="border-white/20 bg-black/60">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-white">{course.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3">
            <nav className="space-y-0.5">
              {course.modules.map((mod) => (
                <div key={mod.id}>
                  <p className="text-xs font-medium text-white/60 px-2 py-1">{mod.title}</p>
                  <ul className="space-y-0.5">
                    {mod.lessons.map((l) => {
                      const isCurrent = l.id === lesson.id
                      const isDone = l.id === lesson.id ? completed : progressByLesson.get(l.id)
                      return (
                        <li key={l.id}>
                          <Link
                            href={`/portal/courses/${course.id}/lessons/${l.id}`}
                            className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
                              isCurrent
                                ? "bg-white/20 text-white"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-white/40 flex-shrink-0" />
                            )}
                            <span className="truncate">{l.title}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* Main: Video + description */}
      <div className="flex-1 min-w-0 space-y-6">
        <div>
          <Link
            href={`/portal/courses/${course.id}`}
            className="text-sm text-white/60 hover:text-white mb-2 inline-block"
          >
            ← {course.title}
          </Link>
          <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
          {lesson.module_title && (
            <p className="text-white/60 text-sm mt-1">{lesson.module_title}</p>
          )}
        </div>

        <Card className="border-white/20 bg-black/60 overflow-hidden">
          <div className="aspect-video bg-black/80 flex items-center justify-center">
            {lesson.video_url ? (
              lesson.video_provider === "youtube" ? (
                <iframe
                  src={lesson.video_url}
                  title={lesson.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={lesson.video_url} controls className="max-w-full max-h-full" />
              )
            ) : (
              <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 text-center text-white/80">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                  <FileText className="h-8 w-8 text-white/80" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-white">Lesson notes and guided walkthrough</h2>
                  <p className="text-sm text-white/70">
                    This lesson does not have a video attached yet, but the written guidance below is still available for agents to review.
                  </p>
                  <p className="text-xs text-white/50">
                    A lesson video can be added later from Admin if you want this section to play media instead.
                  </p>
                </div>
              </div>
            )}
          </div>
          <CardContent className="p-4">
            {lesson.duration_seconds != null && (
              <p className="text-white/60 text-sm mb-2">
                Duration: {Math.round(lesson.duration_seconds / 60)} min
              </p>
            )}
            {lesson.description && (
              <p className="text-white/80 text-sm whitespace-pre-wrap">{lesson.description}</p>
            )}
          </CardContent>
        </Card>

        {userId && (
          <Button
            onClick={handleMarkComplete}
            disabled={saving}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            {completed ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completed
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 mr-2" />
                Mark as complete
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
