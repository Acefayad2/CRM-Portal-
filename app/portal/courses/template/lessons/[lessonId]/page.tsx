import { notFound } from "next/navigation"
import { PortalLayout } from "@/components/portal-layout"
import { LessonViewer } from "@/components/lesson-viewer"
import { templateCourse, getTemplateLesson } from "@/lib/courses-template"

export default async function TemplateLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await params
  const lesson = getTemplateLesson(lessonId)
  if (!lesson) notFound()

  return (
    <PortalLayout>
      <LessonViewer
        course={templateCourse}
        lesson={lesson}
        progress={null}
        courseProgress={[]}
        userId={null}
      />
    </PortalLayout>
  )
}
