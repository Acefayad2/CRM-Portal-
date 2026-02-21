/**
 * POST /api/teams/join
 *
 * Join a team using a team code. Team admins receive a unique code when they
 * purchase a subscription; agents use this code to join their team.
 *
 * Request: { teamCode: string }
 * Returns: { success: true } | { success: false, error: string }
 */
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // TODO: Get current user from Supabase session
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let body: { teamCode?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const teamCode = body?.teamCode?.trim()?.toUpperCase()
    if (!teamCode) {
      return NextResponse.json(
        { error: "Team code is required" },
        { status: 400 }
      )
    }

    // TODO: Validate team code against teams table and add user to team_members
    // const { data: team } = await supabase
    //   .from("teams")
    //   .select("id")
    //   .eq("team_code", teamCode)
    //   .single()
    // if (!team) return NextResponse.json({ error: "Invalid team code" }, { status: 404 })
    // await supabase.from("team_members").insert({ team_id: team.id, user_id: user.id, role: "agent" })

    // Stub: accept any 4+ char code for now
    if (teamCode.length < 4) {
      return NextResponse.json(
        { error: "Invalid team code" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[api/teams/join] Error:", err)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
