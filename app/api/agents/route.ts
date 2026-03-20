import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/agents — list all agents
export async function GET() {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/agents — create a new agent
export async function POST(req: Request) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

  const body = await req.json()
  const { name, role, railway_url } = body

  if (!name || !role) {
    return NextResponse.json({ error: "name and role are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("agents")
    .insert({
      name,
      role,
      railway_url: railway_url || null,
      status: "offline",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
