/**
 * Admin-only course operations. Uses service role. Only call after verifying user is admin.
 */
import { supabase } from "@/lib/supabase"
import type { CourseRow, ModuleRow, LessonRow } from "@/lib/courses-db"

export async function getAdminCourses() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, description, category, level, thumbnail_url, is_published, created_at")
    .order("created_at", { ascending: false })
  if (error) return []
  return (data ?? []) as CourseRow[]
}

export async function getAdminCourseWithOutline(courseId: string) {
  if (!supabase) return null
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single()
  if (courseError || !course) return null

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true })
  if (!modules?.length) return { ...course, modules: [] }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .in("module_id", modules.map((m) => m.id))
    .order("sort_order", { ascending: true })

  const byModule = new Map<string, LessonRow[]>()
  for (const l of lessons ?? []) {
    const list = byModule.get(l.module_id) ?? []
    list.push(l as LessonRow)
    byModule.set(l.module_id, list)
  }

  return {
    ...course,
    modules: modules.map((m) => ({ ...m, lessons: byModule.get(m.id) ?? [] })),
  }
}

export async function createCourse(input: {
  title: string
  description?: string
  category?: string
  level?: string
  thumbnail_url?: string
  is_published?: boolean
}) {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      title: input.title,
      description: input.description ?? null,
      category: input.category ?? null,
      level: input.level ?? null,
      thumbnail_url: input.thumbnail_url ?? null,
      is_published: input.is_published ?? false,
    })
    .select("id")
    .single()
  if (error) throw error
  return data.id as string
}

export async function updateCourse(
  courseId: string,
  input: Partial<{ title: string; description: string; category: string; level: string; thumbnail_url: string; is_published: boolean }>
) {
  const { error } = await supabase.from("courses").update({ ...input, updated_at: new Date().toISOString() }).eq("id", courseId)
  if (error) throw error
}

export async function createModule(courseId: string, input: { title: string; description?: string; sort_order?: number }) {
  const { data, error } = await supabase
    .from("modules")
    .insert({
      course_id: courseId,
      title: input.title,
      description: input.description ?? null,
      sort_order: input.sort_order ?? 0,
    })
    .select("id")
    .single()
  if (error) throw error
  return data.id as string
}

export async function updateModule(
  moduleId: string,
  input: Partial<{ title: string; description: string; sort_order: number }>
) {
  const { error } = await supabase.from("modules").update({ ...input, updated_at: new Date().toISOString() }).eq("id", moduleId)
  if (error) throw error
}

export async function deleteModule(moduleId: string) {
  const { error } = await supabase.from("modules").delete().eq("id", moduleId)
  if (error) throw error
}

export async function createLesson(
  moduleId: string,
  input: {
    title: string
    description?: string
    sort_order?: number
    video_provider?: string
    video_url?: string
    duration_seconds?: number
  }
) {
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      module_id: moduleId,
      title: input.title,
      description: input.description ?? null,
      sort_order: input.sort_order ?? 0,
      video_provider: input.video_provider ?? null,
      video_url: input.video_url ?? null,
      duration_seconds: input.duration_seconds ?? null,
    })
    .select("id")
    .single()
  if (error) throw error
  return data.id as string
}

export async function updateLesson(
  lessonId: string,
  input: Partial<{
    title: string
    description: string
    sort_order: number
    video_provider: string
    video_url: string
    duration_seconds: number
  }>
) {
  const { error } = await supabase.from("lessons").update({ ...input, updated_at: new Date().toISOString() }).eq("id", lessonId)
  if (error) throw error
}

export async function deleteLesson(lessonId: string) {
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId)
  if (error) throw error
}
