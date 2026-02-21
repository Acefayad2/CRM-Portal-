/**
 * PATCH /api/clients/[id] - update client
 * DELETE /api/clients/[id] - delete client
 */
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let body: Partial<Client>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (body.firstName !== undefined) updates.first_name = body.firstName
    if (body.lastName !== undefined) updates.last_name = body.lastName
    if (body.email !== undefined) updates.email = body.email
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.status !== undefined) updates.status = body.status
    if (body.stage !== undefined) updates.stage = body.stage
    if (body.assignedAgent !== undefined) updates.assigned_agent = body.assignedAgent
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.nextAppointment !== undefined) updates.next_appointment = body.nextAppointment ?? null
    if (body.lastContact !== undefined) updates.last_contact = body.lastContact ?? null
    if (body.notes !== undefined) updates.notes = body.notes
    if (body.files !== undefined) updates.files = body.files
    if (body.contactHistory !== undefined) updates.contact_history = body.contactHistory

    const { data: row, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single()

    if (error) {
      console.error("[api/clients] PATCH error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ client: rowToClient(row) })
  } catch (err) {
    console.error("[api/clients] Error:", err)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
    }
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("[api/clients] DELETE error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/clients] Error:", err)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
