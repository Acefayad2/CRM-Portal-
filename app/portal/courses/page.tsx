import { redirect } from "next/navigation"

/**
 * Courses are now combined into Resources. Redirect to Resources with the Courses tab.
 */
export default function CoursesPage() {
  redirect("/portal/resources?tab=courses")
}
