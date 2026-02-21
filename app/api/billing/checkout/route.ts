/**
 * POST /api/billing/checkout
 *
 * Create Stripe Checkout for plan subscription or SMS pack.
 * Body: { type: 'plan' | 'sms_pack', planId?: string, packId?: string, workspaceId: string }
 */
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 })
    }
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    let authClient
    try {
      authClient = await createClient()
    } catch {
      return NextResponse.json({ error: "Auth not configured" }, { status: 503 })
    }
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let body: { type: string; planId?: string; packId?: string; workspaceId?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { type, planId, packId, workspaceId } = body
    const origin = request.headers.get("origin") ?? new URL(request.url).origin

    if (type === "plan") {
      if (!planId || !["team", "business", "enterprise"].includes(planId)) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
      }
      // workspaceId optional: if missing, webhook creates workspace and makes payer the admin
      const planRes = await supabase.from("plans").select("stripe_price_id, price_monthly").eq("id", planId).single()
      const plan = planRes.data
      if (!plan?.stripe_price_id) {
        return NextResponse.json({ error: "Plan not set up for checkout. Add stripe_price_id to plans." }, { status: 400 })
      }

      const metadata: Record<string, string> = {
        type: "plan",
        plan_id: planId,
        user_id: user.id,
      }
      if (workspaceId) metadata.workspace_id = workspaceId

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
        success_url: `${origin}/portal/settings/billing?success=1`,
        cancel_url: `${origin}/portal/settings/billing?canceled=1`,
        metadata,
        subscription_data: { metadata },
      })
      return NextResponse.json({ url: session.url })
    }

    if (type === "sms_pack") {
      if (!packId || !["pack_s", "pack_m", "pack_l"].includes(packId)) {
        return NextResponse.json({ error: "Invalid pack" }, { status: 400 })
      }
      if (!workspaceId) {
        return NextResponse.json({ error: "workspaceId required" }, { status: 400 })
      }
      const packRes = await supabase.from("sms_packs").select("stripe_price_id").eq("id", packId).single()
      const pack = packRes.data
      if (!pack?.stripe_price_id) {
        return NextResponse.json({ error: "Pack not set up. Add stripe_price_id to sms_packs." }, { status: 400 })
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: pack.stripe_price_id, quantity: 1 }],
        success_url: `${origin}/portal/settings/billing?success=sms`,
        cancel_url: `${origin}/portal/settings/billing?canceled=1`,
        metadata: { type: "sms_pack", pack_id: packId, workspace_id: workspaceId },
      })
      return NextResponse.json({ url: session.url })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (err) {
    console.error("[billing/checkout] Error:", err)
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 })
  }
}
