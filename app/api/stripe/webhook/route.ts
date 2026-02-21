/**
 * POST /api/stripe/webhook
 *
 * Stripe webhook handler. Configure in Stripe Dashboard:
 * - customer.subscription.* for plan subscriptions
 * - checkout.session.completed for one-time SMS pack purchases
 */
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  if (!stripe || !webhookSecret || !isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 })
  }

  const body = await request.text()
  const sig = request.headers.get("stripe-signature")
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const workspaceId = sub.metadata?.workspace_id
        const planId = sub.metadata?.plan_id
        if (!workspaceId || !planId) break
        await supabase.from("subscriptions").upsert({
          workspace_id: workspaceId,
          plan_id: planId,
          status: sub.status === "active" ? "active" : sub.status,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        break
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const workspaceId = sub.metadata?.workspace_id
        if (!workspaceId) break
        await supabase.from("subscriptions").update({ status: "canceled", updated_at: new Date().toISOString() }).eq("workspace_id", workspaceId)
        break
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const type = session.metadata?.type
        let workspaceId = session.metadata?.workspace_id?.trim() || null
        const planId = session.metadata?.plan_id
        const userId = session.metadata?.user_id

        if (type === "plan" && planId) {
          // If no workspace yet, create one and make the payer the admin (they get their own team code)
          if (!workspaceId && userId) {
            const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
            let teamCode = ""
            for (let i = 0; i < 6; i++) {
              teamCode += chars[Math.floor(Math.random() * chars.length)]
            }
            for (let i = 0; i < 10; i++) {
              const { data: existing } = await supabase.from("workspaces").select("id").eq("team_code", teamCode).single()
              if (!existing) break
              teamCode = ""
              for (let j = 0; j < 6; j++) {
                teamCode += chars[Math.floor(Math.random() * chars.length)]
              }
            }
            const { data: workspace, error: wsErr } = await supabase
              .from("workspaces")
              .insert({
                name: "My Team",
                owner_id: userId,
                team_code: teamCode,
              })
              .select("id")
              .single()
            if (wsErr) {
              console.error("[stripe/webhook] Workspace creation failed:", wsErr)
              break
            }
            workspaceId = workspace.id
            await supabase.from("workspace_members").insert({
              workspace_id: workspaceId,
              user_id: userId,
              role: "admin",
            })
          }
          if (workspaceId) {
            await supabase.from("subscriptions").upsert({
              workspace_id: workspaceId,
              plan_id: planId,
              status: "active",
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString(),
            }, { onConflict: "workspace_id" })
          }
        } else if (type === "sms_pack" && workspaceId) {
          const packId = session.metadata?.pack_id
          const packRes = await supabase.from("sms_packs").select("sms_credits").eq("id", packId).single()
          const credits = packRes.data?.sms_credits ?? 0
          if (credits > 0) {
            const balanceRes = await supabase.from("sms_credit_balance").select("balance").eq("workspace_id", workspaceId).single()
            const current = balanceRes.data?.balance ?? 0
            await supabase.from("sms_credit_balance").upsert({
              workspace_id: workspaceId,
              balance: current + credits,
              updated_at: new Date().toISOString(),
            }, { onConflict: "workspace_id" })
            await supabase.from("sms_purchases").insert({
              workspace_id: workspaceId,
              pack_id: packId,
              sms_credits_added: credits,
              stripe_payment_intent_id: session.payment_intent as string,
            })
          }
        }
        break
      }
      default:
        // Unhandled event
        break
    }
  } catch (err) {
    console.error("[stripe/webhook] Handler error:", err)
    return NextResponse.json({ error: "Handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
