import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateLesson, deleteLesson } from "@/lib/courses-admin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { lessonId } = await params
  const body = await request.json()
  try {
    await updateLesson(lessonId, {
      title: typeof body.title === "string" ? body.title : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      sort_order: typeof body.sort_order === "number" ? body.sort_order : undefined,
      video_provider: typeof body.video_provider === "string" ? body.video_provider : undefined,
      video_url: typeof body.video_url === "string" ? body.video_url : undefined,
      duration_seconds: typeof body.duration_seconds === "number" ? body.duration_seconds : undefined,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { lessonId } = await params
  try {
    await deleteLesson(lessonId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
