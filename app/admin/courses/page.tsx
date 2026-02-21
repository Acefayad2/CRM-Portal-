import Link from "next/link"
import { getAdminCourses } from "@/lib/courses-admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus } from "lucide-react"
import { CreateCourseForm } from "@/components/admin/create-course-form"

export const dynamic = "force-dynamic"

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Create and manage course outlines.</p>
        </div>
        <CreateCourseForm />
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No courses yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">
                    <Link href={`/admin/courses/${course.id}`} className="hover:underline">
                      {course.title}
                    </Link>
                  </CardTitle>
                  {course.is_published ? (
                    <Badge variant="default">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">{course.description ?? "—"}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {course.category && <span>{course.category}</span>}
                  {course.level && <span>· {course.level}</span>}
                </div>
                <Link href={`/admin/courses/${course.id}`}>
                  <Button variant="outline" size="sm" className="mt-3">
                    Edit outline
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
