import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCourseWithOutline, getLesson, getUserLessonProgress, getUserLessonProgressForLesson } from "@/lib/courses-db"
import { PortalLayout } from "@/components/portal-layout"
import { LessonViewer } from "@/components/lesson-viewer"

export const dynamic = "force-dynamic"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [course, lesson, progress, courseProgress] = await Promise.all([
    getCourseWithOutline(courseId),
    getLesson(lessonId),
    getUserLessonProgressForLesson(user?.id ?? null, lessonId),
    getUserLessonProgress(user?.id ?? null, courseId),
  ])
  if (!course || !lesson || lesson.course_id !== courseId) notFound()

  return (
    <PortalLayout>
      <LessonViewer
        course={course}
        lesson={lesson}
        progress={progress}
        courseProgress={courseProgress}
        userId={user?.id ?? null}
      />
    </PortalLayout>
  )
}
