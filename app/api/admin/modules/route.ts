import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createModule } from "@/lib/courses-admin"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const courseId = body.course_id as string
  const title = body.title as string
  if (!courseId || !title) return NextResponse.json({ error: "course_id and title required" }, { status: 400 })

  try {
    const id = await createModule(courseId, {
      title,
      description: typeof body.description === "string" ? body.description : undefined,
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    })
    return NextResponse.json({ id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
