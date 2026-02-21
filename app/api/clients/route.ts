/**
 * GET /api/clients - list current user's clients (Supabase)
 * POST /api/clients - create a client
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getWorkspaceForUser } from "@/lib/workspace"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Client } from "@/lib/crm-data"

function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: String(row.id),
    firstName: String(row.first_name ?? ""),
    lastName: String(row.last_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    status: (row.status as Client["status"]) ?? "New Lead",
    stage: (row.stage as Client["stage"]) ?? "Prospect",
    assignedAgent: String(row.assigned_agent ?? ""),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    nextAppointment: row.next_appointment ? new Date(row.next_appointment as string).toISOString() : undefined,
    lastContact: row.last_contact ? new Date(row.last_contact as string).toISOString() : undefined,
    createdAt: new Date((row.created_at as string) ?? 0).toISOString(),
    notes: String(row.notes ?? ""),
    files: Array.isArray(row.files) ? (row.files as Client["files"]) : [],
    contactHistory: Array.isArray(row.contact_history) ? (row.contact_history as Client["contactHistory"]) : [],
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    if (!membership) return NextResponse.json({ clients: [] }) // no workspace = empty list

    const { data: rows, error } = await supabase
      .from("clients")
      .select("*")
      .eq("workspace_id", membership.workspace_id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[api/clients] GET error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const clients = (rows ?? []).map(rowToClient)
    return NextResponse.json({ clients })
  } catch (err) {
    console.error("[api/clients] Error:", err)
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const membership = await getWorkspaceForUser(user.id)
    if (!membership) return NextResponse.json({ error: "No workspace" }, { status: 400 })

    let body: Partial<Client>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { data: row, error } = await supabase
      .from("clients")
      .insert({
        workspace_id: membership.workspace_id,
        user_id: user.id,
        first_name: body.firstName ?? "",
        last_name: body.lastName ?? "",
        email: body.email ?? "",
        phone: body.phone ?? "",
        status: body.status ?? "New Lead",
        stage: body.stage ?? "Prospect",
        assigned_agent: body.assignedAgent ?? "",
        tags: body.tags ?? [],
        next_appointment: body.nextAppointment ?? null,
        last_contact: body.lastContact ?? null,
        notes: body.notes ?? "",
        files: body.files ?? [],
        contact_history: body.contactHistory ?? [],
      })
      .select("*")
      .single()

    if (error) {
      console.error("[api/clients] POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ client: rowToClient(row) })
  } catch (err) {
    console.error("[api/clients] Error:", err)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
