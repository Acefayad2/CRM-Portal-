import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET /api/agents/[id]/messages — get chat history
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("bot_id", params.id)
    .order("created_at", { ascending: true })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/agents/[id]/messages — send a message to the agent
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

  const { content } = await req.json()
  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 })

  // Save user message
  const { data: userMsg, error: userErr } = await supabase
    .from("messages")
    .insert({ bot_id: params.id, sender: "user", content })
    .select()
    .single()

  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })

  // Get agent's railway_url to forward message
  const { data: agent } = await supabase
    .from("agents")
    .select("railway_url, name")
    .eq("id", params.id)
    .single()

  // If the bot has a Railway URL, forward the message
  if (agent?.railway_url) {
    try {
      const botRes = await fetch(`${agent.railway_url}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, agent_id: params.id }),
        signal: AbortSignal.timeout(10000),
      })

      if (botRes.ok) {
        const botData = await botRes.json()
        // Save bot's reply
        await supabase.from("messages").insert({
          bot_id: params.id,
          sender: "bot",
          content: botData.reply ?? botData.message ?? "Task received.",
        })
      }
    } catch {
      // Bot unreachable — save an offline message
      await supabase.from("messages").insert({
        bot_id: params.id,
        sender: "bot",
        content: "I'm currently offline. Your message has been saved.",
      })
    }
  }

  return NextResponse.json(userMsg, { status: 201 })
}
