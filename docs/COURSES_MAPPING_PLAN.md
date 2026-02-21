# Courses Mapping Plan: Resources Page → Courses/Modules/Lessons

## Current Resources Page Structure

The portal has **two main content areas**:

1. **Training** tab – data from `lib/training-modules-data.ts`
   - 3 training modules: **Licensing**, **CFT Training**, **Appointment Training**
   - Each module has 6–7 lessons (video, reading, quiz, practice)
   - Categories: `licensing` | `cft` | `appointment`

2. **Resources** tab – `placeholderResources` in `app/portal/resources/page.tsx`
   - 14 items: PDFs, videos, documents, links
   - Categories: product, compliance, marketing, guides, templates

## Mapping to DB-Backed Courses

### Courses (3 from training modules)

| Course | Source | Category | Level | Modules (seed) | Lessons |
|--------|--------|----------|-------|----------------|---------|
| **Licensing Module** | `trainingModules[0]` | licensing | beginner | 1 module | 6 lessons |
| **CFT Training** | `trainingModules[1]` | cft | beginner | 1 module | 7 lessons |
| **Appointment Training** | `trainingModules[2]` | appointment | beginner | 1 module | 7 lessons |

Each training module becomes **one course**. For the seed we use **one module per course** (e.g. "Course content") containing all lessons, so the hierarchy is course → single module → lessons. Admins can add more modules later via the outline builder.

### Lessons

- Every lesson in `training-modules-data.ts` becomes a row in `lessons` with:
  - `title`, `description`, `sort_order` (array index)
  - `video_provider`: `'youtube'` or null; `video_url`: empty for now (placeholder)
  - `duration_seconds`: parsed from strings like `"30 min"` (e.g. 1800) or null
- `lesson_quiz_items`: left empty in seed (for later quiz-at-timestamp feature)

### Resources Library (14 items)

- **Not** converted into course lessons in the initial seed. The existing Resources tab stays as-is (grid of PDF/video/link cards).
- Optionally later: one course "Resources Library" with modules by category (Product, Compliance, etc.) and each resource as a lesson (view/download).

## UI Plan

- **/portal/resources** – Keep Overview + Training + Resources tabs; add a **Courses** tab that links to `/portal/courses` or inlines course cards.
- **/portal/courses** – List published courses with category filter; progress indicator (X% or "Continue").
- **/portal/courses/[courseId]** – Course detail: sidebar with modules/lessons outline, progress; main area CTA to start/continue first lesson.
- **/portal/courses/[courseId]/lessons/[lessonId]** – Lesson viewer: left outline sidebar, main area = video embed placeholder + description; progress (completed / last_watched_seconds).
- **/admin/courses** – List courses; create new course (admin only).
- **/admin/courses/[courseId]** – Edit course; manage modules (add/edit/delete, sort_order); manage lessons per module (add/edit/delete, sort_order). Use shadcn forms + server actions.

## Progress Tracking

- **user_lesson_progress**: one row per user per lesson; `last_watched_seconds`, `completed`, `score`, `attempts`.
- Course progress = % of lessons with `completed = true` for that user.
- Display: "Completed", "Continue from Lesson X", or "X% complete".
