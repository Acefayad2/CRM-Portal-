import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCourseWithOutline, getUserLessonProgress } from "@/lib/courses-db"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, CheckCircle2, Circle, Play } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export const dynamic = "force-dynamic"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const course = await getCourseWithOutline(courseId)
  if (!course) notFound()

  const progress = await getUserLessonProgress(user?.id ?? null)
  const progressByLesson = new Map(progress.map((p) => [p.lesson_id, p]))

  const allLessons = course.modules.flatMap((m) => m.lessons)
  const total = allLessons.length
  const completedCount = allLessons.filter((l) => progressByLesson.get(l.id)?.completed).length
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const firstLessonId = allLessons[0]?.id
  const nextIncomplete = allLessons.find((l) => !progressByLesson.get(l.id)?.completed)

  return (
    <PortalLayout>
      <div className="space-y-8">
        <div>
          <Link href="/portal/courses" className="text-sm text-white/60 hover:text-white mb-2 inline-block">
            ← Back to Courses
          </Link>
          <h1 className="text-3xl font-bold text-white">{course.title}</h1>
          <p className="text-white/70 mt-1">{course.description ?? "—"}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {course.category && (
              <Badge variant="outline" className="border-white/20 text-white/80">
                {course.category}
              </Badge>
            )}
            {course.level && (
              <Badge variant="outline" className="border-white/20 text-white/60">
                {course.level}
              </Badge>
            )}
          </div>
        </div>

        <Card className="border-white/20 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Your progress
            </CardTitle>
            <CardDescription className="text-white/70">
              {completedCount} of {total} lessons completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={percent} className="h-3 bg-white/10 mb-4" />
            {nextIncomplete ? (
              <Link
                href={`/portal/courses/${courseId}/lessons/${nextIncomplete.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium border border-white/20"
              >
                <Play className="h-4 w-4" />
                {completedCount === 0 ? "Start course" : "Continue"}
              </Link>
            ) : total > 0 ? (
              <p className="text-green-400 text-sm font-medium">You’ve completed this course.</p>
            ) : null}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Course outline</h2>
          <div className="space-y-6">
            {course.modules.map((mod) => (
              <Card key={mod.id} className="border-white/20 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">{mod.title}</CardTitle>
                  {mod.description && (
                    <CardDescription className="text-white/70 text-sm">{mod.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {mod.lessons.map((lesson) => {
                      const isCompleted = progressByLesson.get(lesson.id)?.completed
                      const href = `/portal/courses/${courseId}/lessons/${lesson.id}`
                      return (
                        <li key={lesson.id}>
                          <Link
                            href={href}
                            className="flex items-center gap-3 rounded-lg p-2 -mx-2 text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-white/40 flex-shrink-0" />
                            )}
                            <span className="flex-1">{lesson.title}</span>
                            {lesson.duration_seconds != null && (
                              <span className="text-white/50 text-sm">
                                {Math.round(lesson.duration_seconds / 60)} min
                              </span>
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
