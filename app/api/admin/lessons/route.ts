import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createLesson } from "@/lib/courses-admin"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await request.json()
  const moduleId = body.module_id as string
  const title = body.title as string
  if (!moduleId || !title) return NextResponse.json({ error: "module_id and title required" }, { status: 400 })

  try {
    const id = await createLesson(moduleId, {
      title,
      description: typeof body.description === "string" ? body.description : undefined,
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
      video_provider: typeof body.video_provider === "string" ? body.video_provider : undefined,
      video_url: typeof body.video_url === "string" ? body.video_url : undefined,
      duration_seconds: typeof body.duration_seconds === "number" ? body.duration_seconds : undefined,
    })
    return NextResponse.json({ id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
