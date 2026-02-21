import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createCourse } from "@/lib/courses-admin"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const title = body.title as string
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title required" }, { status: 400 })
  }

  try {
    const id = await createCourse({
      title: title.trim(),
      description: typeof body.description === "string" ? body.description.trim() || undefined : undefined,
      category: typeof body.category === "string" ? body.category : undefined,
      level: typeof body.level === "string" ? body.level : undefined,
      is_published: false,
    })
    return NextResponse.json({ id })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create course" },
      { status: 500 }
    )
  }
}
