import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// POST /api/agents/dispatch — create a job and assign it to an agent
export async function POST(req: Request) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

  const body = await req.json()
  const { agent_id, title, description, priority = "normal" } = body

  if (!agent_id || !title) {
    return NextResponse.json({ error: "agent_id and title are required" }, { status: 400 })
  }

  // Get the agent
  const { data: agent, error: agentErr } = await supabase
    .from("agents")
    .select("id, name, railway_url, status")
    .eq("id", agent_id)
    .single()

  if (agentErr || !agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  // Create the job
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({
      title,
      description: description || null,
      priority,
      status: "queued",
      assigned_to: agent.name,
      payload: { agent_id, description },
      result: {},
    })
    .select()
    .single()

  if (jobErr) return NextResponse.json({ error: jobErr.message }, { status: 500 })

  // Update agent status to busy
  await supabase.from("agents").update({ status: "busy", current_job_id: job.id }).eq("id", agent_id)

  // If the bot has a Railway URL, forward the task
  if (agent.railway_url) {
    try {
      await fetch(`${agent.railway_url}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job.id,
          title,
          description,
          priority,
          webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/agents/webhook`,
        }),
        signal: AbortSignal.timeout(10000),
      })
    } catch {
      // Bot unreachable — job stays queued for when it comes online
      console.warn(`Agent ${agent.name} unreachable at ${agent.railway_url}`)
    }
  }

  return NextResponse.json(job, { status: 201 })
}
