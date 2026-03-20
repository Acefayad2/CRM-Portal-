import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/agents/[id]/jobs — get job history for an agent
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("assigned_to", params.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
