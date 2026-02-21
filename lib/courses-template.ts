/**
 * Template/demo course data so users can see the course setup without DB.
 * Matches CourseWithOutline and lesson shapes from courses-db.
 */
import type { CourseWithOutline, LessonRow } from "@/lib/courses-db"

const TEMPLATE_COURSE_ID = "template"
const TEMPLATE_MODULE_ID = "template-module"

export const templateCourse: CourseWithOutline = {
  id: TEMPLATE_COURSE_ID,
  title: "Template Course (demo)",
  description:
    "This is a sample course so you can see how courses, modules, and lessons are laid out. Create real courses in Admin → Courses and they will appear on the main Courses page.",
  category: "getting-started",
  level: "beginner",
  thumbnail_url: null,
  is_published: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  modules: [
    {
      id: TEMPLATE_MODULE_ID,
      course_id: TEMPLATE_COURSE_ID,
      title: "Module 1: Getting started",
      description: "Intro and setup.",
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lessons: [
        {
          id: "template-lesson-1",
          module_id: TEMPLATE_MODULE_ID,
          title: "Welcome and overview",
          description:
            "This is what a lesson looks like. You can add a video URL in Admin → Courses → [course] and it will show here. Progress (completed / last position) is saved when you're signed in.",
          sort_order: 0,
          video_provider: null,
          video_url: null,
          duration_seconds: 300,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "template-lesson-2",
          module_id: TEMPLATE_MODULE_ID,
          title: "Second lesson",
          description: "Lessons can have descriptions and optional video. Use the outline on the left to jump between lessons.",
          sort_order: 1,
          video_provider: null,
          video_url: null,
          duration_seconds: 420,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "template-lesson-3",
          module_id: TEMPLATE_MODULE_ID,
          title: "Quizzes (coming later)",
          description:
            "Later you can add quiz items at specific timestamps so the video pauses and asks a question. For now we focus on outline and progress.",
          sort_order: 2,
          video_provider: null,
          video_url: null,
          duration_seconds: 600,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
  ],
}

export function getTemplateLesson(lessonId: string): (LessonRow & { course_id: string; module_title: string }) | null {
  for (const mod of templateCourse.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId)
    if (lesson)
      return {
        ...lesson,
        course_id: TEMPLATE_COURSE_ID,
        module_title: mod.title,
      }
  }
  return null
}

export function isTemplateLessonId(lessonId: string): boolean {
  return lessonId.startsWith("template-lesson-")
}
