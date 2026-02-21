/**
 * Server-side course data access. Use from Server Components or route handlers.
 * Uses Supabase server client (RLS applies).
 */
import { createClient } from "@/lib/supabase/server"

export type CourseRow = {
  id: string
  title: string
  description: string | null
  category: string | null
  level: string | null
  thumbnail_url: string | null
  is_published: boolean
  created_at: string
}

export type ModuleRow = {
  id: string
  course_id: string
  title: string
  description: string | null
  sort_order: number
  created_at: string
}

export type LessonRow = {
  id: string
  module_id: string
  title: string
  description: string | null
  sort_order: number
  video_provider: string | null
  video_url: string | null
  duration_seconds: number | null
  created_at: string
}

export type LessonWithModule = LessonRow & { module_title: string; module_sort_order: number }

export type ModuleWithLessons = ModuleRow & { lessons: LessonRow[] }

export type CourseWithOutline = CourseRow & { modules: ModuleWithLessons[] }

export type UserLessonProgressRow = {
  id: string
  user_id: string
  lesson_id: string
  last_watched_seconds: number
  completed: boolean
  score: number | null
  attempts: number
  updated_at: string
}

/** List all published courses */
export async function getPublishedCourses(): Promise<CourseRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, description, category, level, thumbnail_url, is_published, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: true })
  if (error) {
    console.error("getPublishedCourses", error)
    return []
  }
  return (data ?? []) as CourseRow[]
}

/** Get one course with modules and lessons (for outline). Only published. */
export async function getCourseWithOutline(courseId: string): Promise<CourseWithOutline | null> {
  const supabase = await createClient()
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title, description, category, level, thumbnail_url, is_published, created_at")
    .eq("id", courseId)
    .eq("is_published", true)
    .single()
  if (courseError || !course) return null

  const { data: modules } = await supabase
    .from("modules")
    .select("id, course_id, title, description, sort_order, created_at")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true })
  if (!modules?.length) {
    return { ...course, modules: [] } as CourseWithOutline
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, module_id, title, description, sort_order, video_provider, video_url, duration_seconds, created_at")
    .in("module_id", modules.map((m) => m.id))
    .order("sort_order", { ascending: true })

  const lessonsByModule = new Map<string, LessonRow[]>()
  for (const l of lessons ?? []) {
    const list = lessonsByModule.get(l.module_id) ?? []
    list.push(l as LessonRow)
    lessonsByModule.set(l.module_id, list)
  }

  const modulesWithLessons: ModuleWithLessons[] = modules.map((m) => ({
    ...m,
    lessons: lessonsByModule.get(m.id) ?? [],
  })) as ModuleWithLessons[]

  return { ...course, modules: modulesWithLessons } as CourseWithOutline
}

/** Get a single lesson (must belong to a published course) */
export async function getLesson(lessonId: string): Promise<LessonRow & { course_id: string; module_title: string } | null> {
  const supabase = await createClient()
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, module_id, title, description, sort_order, video_provider, video_url, duration_seconds, created_at")
    .eq("id", lessonId)
    .single()
  if (lessonError || !lesson) return null

  const { data: module } = await supabase
    .from("modules")
    .select("id, course_id, title, sort_order")
    .eq("id", lesson.module_id)
    .single()
  if (!module) return null

  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("id", module.course_id)
    .eq("is_published", true)
    .single()
  if (!course) return null

  return {
    ...lesson,
    course_id: module.course_id,
    module_title: module.title,
  } as LessonRow & { course_id: string; module_title: string }
}

/** Get progress for the current user for lessons in the given course (or all if courseId omitted) */
export async function getUserLessonProgress(
  userId: string | null,
  courseId?: string
): Promise<UserLessonProgressRow[]> {
  if (!userId) return []
  const supabase = await createClient()
  if (courseId) {
    const { data: modules } = await supabase.from("modules").select("id").eq("course_id", courseId)
    const moduleIds = (modules ?? []).map((m) => m.id)
    if (moduleIds.length === 0) return []
    const { data: lessons } = await supabase.from("lessons").select("id").in("module_id", moduleIds)
    const lessonIds = (lessons ?? []).map((l) => l.id)
    if (lessonIds.length === 0) return []
    const { data, error } = await supabase
      .from("user_lesson_progress")
      .select("id, user_id, lesson_id, last_watched_seconds, completed, score, attempts, updated_at")
      .eq("user_id", userId)
      .in("lesson_id", lessonIds)
    if (error) return []
    return (data ?? []) as UserLessonProgressRow[]
  }
  const { data, error } = await supabase
    .from("user_lesson_progress")
    .select("id, user_id, lesson_id, last_watched_seconds, completed, score, attempts, updated_at")
    .eq("user_id", userId)
  if (error) return []
  return (data ?? []) as UserLessonProgressRow[]
}

/** Get progress for a single lesson */
export async function getUserLessonProgressForLesson(
  userId: string | null,
  lessonId: string
): Promise<UserLessonProgressRow | null> {
  if (!userId) return null
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("user_lesson_progress")
    .select("id, user_id, lesson_id, last_watched_seconds, completed, score, attempts, updated_at")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .single()
  if (error || !data) return null
  return data as UserLessonProgressRow
}

/** Upsert progress for current user (server action or route handler) */
export async function upsertLessonProgress(
  userId: string,
  lessonId: string,
  updates: { last_watched_seconds?: number; completed?: boolean; score?: number; attempts?: number }
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.from("user_lesson_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      ...updates,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  )
  return { error: error?.message ?? null }
}
