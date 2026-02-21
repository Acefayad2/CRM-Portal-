import Link from "next/link"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Circle, Play } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { templateCourse } from "@/lib/courses-template"

export default function TemplateCoursePage() {
  const allLessons = templateCourse.modules.flatMap((m) => m.lessons)
  const total = allLessons.length
  const nextLesson = allLessons[0]

  return (
    <PortalLayout>
      <div className="space-y-8">
        <div>
          <Link href="/portal/courses" className="text-sm text-white/60 hover:text-white mb-2 inline-block">
            ← Back to Courses
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-amber-500/50 text-amber-200">
              Demo template
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-white">{templateCourse.title}</h1>
          <p className="text-white/70 mt-1">{templateCourse.description}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {templateCourse.category && (
              <Badge variant="outline" className="border-white/20 text-white/80">
                {templateCourse.category}
              </Badge>
            )}
            {templateCourse.level && (
              <Badge variant="outline" className="border-white/20 text-white/60">
                {templateCourse.level}
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
              Template progress is not saved. Real courses track completion when you’re signed in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={0} className="h-3 bg-white/10 mb-4" />
            {nextLesson && (
              <Link
                href={`/portal/courses/template/lessons/${nextLesson.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium border border-white/20"
              >
                <Play className="h-4 w-4" />
                Start template
              </Link>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Course outline</h2>
          <div className="space-y-6">
            {templateCourse.modules.map((mod) => (
              <Card key={mod.id} className="border-white/20 bg-white/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">{mod.title}</CardTitle>
                  {mod.description && (
                    <CardDescription className="text-white/70 text-sm">{mod.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          href={`/portal/courses/template/lessons/${lesson.id}`}
                          className="flex items-center gap-3 rounded-lg p-2 -mx-2 text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Circle className="h-5 w-5 text-white/40 flex-shrink-0" />
                          <span className="flex-1">{lesson.title}</span>
                          {lesson.duration_seconds != null && (
                            <span className="text-white/50 text-sm">
                              {Math.round(lesson.duration_seconds / 60)} min
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
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
