import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// POST /api/agents/webhook — called by Railway bots when a job completes
export async function POST(req: Request) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

  const body = await req.json()
  const { job_id, agent_name, status, result, error_message } = body

  if (!job_id || !status) {
    return NextResponse.json({ error: "job_id and status are required" }, { status: 400 })
  }

  const validStatuses = ["in_progress", "completed", "failed"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  // Update the job
  const updatePayload: Record<string, unknown> = {
    status,
    result: result ?? {},
    error_message: error_message ?? null,
  }

  if (status === "in_progress") updatePayload.started_at = new Date().toISOString()
  if (status === "completed" || status === "failed") {
    updatePayload.completed_at = new Date().toISOString()
  }

  const { error: jobErr } = await supabase
    .from("jobs")
    .update(updatePayload)
    .eq("id", job_id)

  if (jobErr) return NextResponse.json({ error: jobErr.message }, { status: 500 })

  // If job is done, set agent back to idle
  if (status === "completed" || status === "failed") {
    if (agent_name) {
      await supabase
        .from("agents")
        .update({ status: "idle", current_job_id: null })
        .eq("name", agent_name)
    }

    // Save a message from the bot with the result summary
    const { data: job } = await supabase
      .from("jobs")
      .select("assigned_to, title")
      .eq("id", job_id)
      .single()

    if (job) {
      const { data: agent } = await supabase
        .from("agents")
        .select("id")
        .eq("name", job.assigned_to)
        .single()

      if (agent) {
        const summary =
          status === "completed"
            ? `Task "${job.title}" completed. ${result ? JSON.stringify(result) : ""}`
            : `Task "${job.title}" failed. ${error_message ?? "Unknown error."}`

        await supabase.from("messages").insert({
          bot_id: agent.id,
          sender: "bot",
          content: summary,
        })
      }
    }
  }

  // Log heartbeat
  await supabase.from("job_logs").insert({
    job_id,
    agent_name: agent_name ?? "unknown",
    level: status === "failed" ? "error" : "info",
    message: `Job status updated to ${status}`,
  })

  return NextResponse.json({ ok: true })
}
