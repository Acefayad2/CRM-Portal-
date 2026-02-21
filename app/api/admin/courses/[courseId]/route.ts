import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateCourse } from "@/lib/courses-admin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { courseId } = await params
  const body = await request.json()
  try {
    await updateCourse(courseId, {
      title: typeof body.title === "string" ? body.title : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      level: typeof body.level === "string" ? body.level : undefined,
      thumbnail_url: typeof body.thumbnail_url === "string" ? body.thumbnail_url : undefined,
      is_published: typeof body.is_published === "boolean" ? body.is_published : undefined,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
