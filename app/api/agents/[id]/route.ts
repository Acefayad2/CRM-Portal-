import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/agents/[id] — get single agent
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

// PATCH /api/agents/[id] — update agent (status, railway_url, etc.)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

  const body = await req.json()

  const { data, error } = await supabase
    .from("agents")
    .update(body)
    .eq("id", params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/agents/[id] — remove agent
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

  const { error } = await supabase.from("agents").delete().eq("id", params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
