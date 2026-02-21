/**
 * Workspace, subscription, and SMS usage helpers.
 * Uses service role for admin operations.
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export type PlanId = "team" | "business" | "enterprise"
export type SmsPackId = "pack_s" | "pack_m" | "pack_l"

export async function getWorkspaceForUser(userId: string) {
  if (!isSupabaseConfigured() || !supabase) return null
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", userId)
    .limit(1)
    .single()
  return data
}

export async function getWorkspaceWithSubscription(workspaceId: string) {
  if (!isSupabaseConfigured() || !supabase) return null
  const { data } = await supabase
    .from("workspaces")
    .select(`
      *,
      subscriptions (
        plan_id,
        status,
        current_period_end
      )
    `)
    .eq("id", workspaceId)
    .single()
  return data
}

export async function getBillingInfo(workspaceId: string) {
  if (!isSupabaseConfigured() || !supabase) return null
  const [subRes, usageRes, balanceRes, memberRes, plansRes] = await Promise.all([
    supabase.from("subscriptions").select("*, plans(*)").eq("workspace_id", workspaceId).single(),
    supabase.from("usage_monthly").select("sms_sent").eq("workspace_id", workspaceId).eq("month", new Date().toISOString().slice(0, 7) + "-01").single(),
    supabase.from("sms_credit_balance").select("balance").eq("workspace_id", workspaceId).single(),
    supabase.from("workspace_members").select("role", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("plans").select("id, price_monthly, max_members, max_admins, included_sms"),
  ])
  const memberCount = memberRes.count ?? 0
  const adminCount = (await supabase.from("workspace_members").select("role", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("role", "admin")).count ?? 0
  return {
    subscription: subRes.data,
    usage: usageRes.data,
    creditBalance: balanceRes.data?.balance ?? 0,
    memberCount,
    adminCount,
    plans: plansRes.data,
  }
}

export async function canSendSms(workspaceId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: "SMS not configured" }
  }
  const subRes = await supabase.from("subscriptions").select("plan_id, status").eq("workspace_id", workspaceId).single()
  const sub = subRes.data
  if (!sub || sub.status !== "active") {
    return { ok: false, error: "No active subscription" }
  }
  const planRes = await supabase.from("plans").select("included_sms").eq("id", sub.plan_id).single()
  const plan = planRes.data
  if (!plan) return { ok: false, error: "Plan not found" }

  const monthStart = new Date().toISOString().slice(0, 7) + "-01"
  const usageRes = await supabase.from("usage_monthly").select("sms_sent").eq("workspace_id", workspaceId).eq("month", monthStart).single()
  const usage = usageRes.data?.sms_sent ?? 0
  const balanceRes = await supabase.from("sms_credit_balance").select("balance").eq("workspace_id", workspaceId).single()
  const balance = balanceRes.data?.balance ?? 0

  if (usage < plan.included_sms) return { ok: true }
  if (balance > 0) return { ok: true }
  return { ok: false, error: "SMS limit reached. Buy an SMS pack to continue." }
}

export async function recordSmsSent(workspaceId: string) {
  if (!isSupabaseConfigured() || !supabase) return
  const monthStart = new Date().toISOString().slice(0, 7) + "-01"
  const subRes = await supabase.from("subscriptions").select("plan_id").eq("workspace_id", workspaceId).single()
  const planRes = await supabase.from("plans").select("included_sms").eq("id", subRes.data?.plan_id).single()
  const includedSms = planRes.data?.included_sms ?? 0
  const usageRes = await supabase.from("usage_monthly").select("sms_sent").eq("workspace_id", workspaceId).eq("month", monthStart).single()
  const currentUsage = usageRes.data?.sms_sent ?? 0

  if (currentUsage < includedSms) {
    if (usageRes.data) {
      await supabase.from("usage_monthly").update({ sms_sent: currentUsage + 1 }).eq("workspace_id", workspaceId).eq("month", monthStart)
    } else {
      await supabase.from("usage_monthly").insert({ workspace_id: workspaceId, month: monthStart, sms_sent: 1 })
    }
    return
  }

  const balanceRes = await supabase.from("sms_credit_balance").select("balance").eq("workspace_id", workspaceId).single()
  if (balanceRes.data && balanceRes.data.balance > 0) {
    await supabase.from("sms_credit_balance").update({ balance: balanceRes.data.balance - 1, updated_at: new Date().toISOString() }).eq("workspace_id", workspaceId)
  }
}
