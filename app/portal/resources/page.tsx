import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { getPublishedCourses, getUserLessonProgress } from "@/lib/courses-db"
import { templateCourse } from "@/lib/courses-template"
import { ResourcesContent, type CourseForResources, type CoursesData } from "./resources-content"

export const dynamic = "force-dynamic"

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const defaultTab = tab === "courses" || tab === "modules" || tab === "resources" || tab === "overview" ? tab : "overview"

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const membership = await getWorkspaceForUser(user?.id ?? "")
  const isTeamAdmin = membership?.role === "admin"

  const courses = await getPublishedCourses()
  const progress = await getUserLessonProgress(user?.id ?? null)

  const courseIds = courses.map((c) => c.id)
  const { data: modules } = courseIds.length
    ? await supabase.from("modules").select("id, course_id").in("course_id", courseIds)
    : { data: [] }
  const moduleIds = (modules ?? []).map((m) => m.id)
  const courseIdByModuleId = new Map((modules ?? []).map((m) => [m.id, m.course_id]))
  const { data: lessons } = moduleIds.length
    ? await supabase.from("lessons").select("id, module_id").in("module_id", moduleIds)
    : { data: [] }

  const lessonCountByCourseId: Record<string, number> = {}
  for (const l of lessons ?? []) {
    const cid = courseIdByModuleId.get(l.module_id)
    if (cid) lessonCountByCourseId[cid] = (lessonCountByCourseId[cid] ?? 0) + 1
  }

  const completedByCourseId: Record<string, number> = {}
  for (const p of progress) {
    if (!p.completed) continue
    for (const l of lessons ?? []) {
      if (l.id === p.lesson_id) {
        const cid = courseIdByModuleId.get(l.module_id)
        if (cid) completedByCourseId[cid] = (completedByCourseId[cid] ?? 0) + 1
        break
      }
    }
  }

  const coursesForClient: CourseForResources[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    level: c.level,
  }))

  const templateSummary = {
    title: templateCourse.title,
    description: templateCourse.description ?? "",
    category: templateCourse.category,
    level: templateCourse.level,
    lessonCount: templateCourse.modules.reduce((sum, m) => sum + m.lessons.length, 0),
  }

  const coursesData: CoursesData = {
    courses: coursesForClient,
    lessonCountByCourseId,
    completedByCourseId,
    templateSummary,
  }

  return <ResourcesContent coursesData={coursesData} defaultTab={defaultTab} isTeamAdmin={isTeamAdmin} />
}
