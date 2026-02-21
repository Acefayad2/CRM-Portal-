import { notFound } from "next/navigation"
import Link from "next/link"
import { getAdminCourseWithOutline } from "@/lib/courses-admin"
import { AdminCourseEditor } from "@/components/admin/admin-course-editor"

export const dynamic = "force-dynamic"

export default async function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getAdminCourseWithOutline(courseId)
  if (!course) notFound()

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-foreground">
          ← Courses
        </Link>
        <h1 className="text-2xl font-bold mt-2">{course.title}</h1>
        <p className="text-muted-foreground">{course.description ?? "—"}</p>
      </div>
      <AdminCourseEditor course={course} />
    </div>
  )
}
