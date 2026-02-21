"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, MessageSquare, Users, Zap } from "lucide-react"

const PLANS = [
  { id: "team", name: "Team", price: 59, max_members: 10, max_admins: 1, included_sms: 250 },
  { id: "business", name: "Business", price: 129, max_members: 30, max_admins: 3, included_sms: 1000 },
  { id: "enterprise", name: "Enterprise", price: 299, max_members: 100, max_admins: 10, included_sms: 3000 },
]

const SMS_PACKS = [
  { id: "pack_s", name: "Pack S", credits: 500, price: 15 },
  { id: "pack_m", name: "Pack M", credits: 2000, price: 45 },
  { id: "pack_l", name: "Pack L", credits: 5000, price: 99 },
]

export default function BillingPage() {
  const [billing, setBilling] = useState<{
    workspace: { id: string; name: string; team_code: string } | null
    membership: { role: string } | null
    billing: {
      subscription: { plan_id: string; status: string } | null
      usage: { sms_sent: number } | null
      creditBalance: number
      memberCount: number
      adminCount: number
    } | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const data = await fetch("/api/billing/info").then((r) => r.json())
      if (!cancelled) setBilling(data)
    }
    load().catch(console.error).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Poll for workspace when returning from successful plan payment (webhook may be delayed)
  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    if (params.get("success") !== "1" || billing?.workspace) return
    const t = setInterval(async () => {
      const data = await fetch("/api/billing/info").then((r) => r.json())
      if (data.workspace) {
        setBilling(data)
        setLoading(false)
        window.history.replaceState({}, "", "/portal/settings/billing")
        clearInterval(t)
      }
    }, 1500)
    return () => clearInterval(t)
  }, [billing?.workspace])

  async function startCheckout(type: "plan" | "sms_pack", planId?: string, packId?: string) {
    const workspaceId = billing?.workspace?.id
    if (type === "sms_pack" && !workspaceId) {
      alert("Create a team first by subscribing to a plan")
      return
    }
    setCheckoutLoading(planId || packId || "")
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          planId: type === "plan" ? planId : undefined,
          packId: type === "sms_pack" ? packId : undefined,
          workspaceId,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error || "Checkout failed")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Checkout failed")
    } finally {
      setCheckoutLoading(null)
    }
  }

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/portal/settings" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing</h1>
            <p className="text-muted-foreground">Manage your subscription and SMS credits</p>
          </div>
        </div>

        {!billing?.workspace ? (
          <Card className="border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle>Subscribe to create your team</CardTitle>
              <CardDescription>
                Choose a plan to become the admin of your own team. You&apos;ll get a unique team code to share so others can join.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-lg border border-white/20 p-4 space-y-3"
                  >
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-2xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-xs text-muted-foreground">{plan.max_members} members · {plan.included_sms} SMS/mo</p>
                    <Button
                      size="sm"
                      onClick={() => startCheckout("plan", plan.id)}
                      disabled={!!checkoutLoading}
                    >
                      {checkoutLoading === plan.id ? "Loading..." : "Subscribe & create team"}
                    </Button>
                  </div>
                ))}
              </div>
              {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("success") === "1" && (
                <p className="text-sm text-muted-foreground mt-4">Setting up your team... You&apos;ll see your team code here shortly.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle>Workspace</CardTitle>
                <CardDescription>{billing.workspace.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Team code:</span>
                  <code className="px-2 py-1 bg-white/10 rounded font-mono">{billing.workspace.team_code}</code>
                  <span className="text-xs text-muted-foreground">Share this for agents to join</span>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{billing.billing?.memberCount ?? 0} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>{billing.billing?.adminCount ?? 0} admins</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plan
                </CardTitle>
                <CardDescription>
                  {billing.billing?.subscription ? (
                    <>
                      <Badge variant={billing.billing.subscription.status === "active" ? "default" : "secondary"}>
                        {billing.billing.subscription.status}
                      </Badge>
                      {" — "}
                      {PLANS.find((p) => p.id === billing.billing?.subscription?.plan_id)?.name ?? billing.billing.subscription.plan_id}
                    </>
                  ) : (
                    "No active subscription"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!billing.billing?.subscription || billing.billing.subscription.status !== "active" ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        className="rounded-lg border border-white/20 p-4 space-y-3"
                      >
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-2xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                        <p className="text-xs text-muted-foreground">{plan.max_members} members · {plan.included_sms} SMS/mo</p>
                        <Button
                          size="sm"
                          onClick={() => startCheckout("plan", plan.id)}
                          disabled={!!checkoutLoading}
                        >
                          {checkoutLoading === plan.id ? "Loading..." : "Subscribe"}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => startCheckout("plan", "business")}>
                    Upgrade plan
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  SMS
                </CardTitle>
                <CardDescription>
                  This month: {billing.billing?.usage?.sms_sent ?? 0} sent
                  {billing.billing?.subscription && (
                    <> · {PLANS.find((p) => p.id === billing.billing?.subscription?.plan_id)?.included_sms ?? 0} included</>
                  )}
                  {" · "}
                  {billing.billing?.creditBalance ?? 0} credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {SMS_PACKS.map((pack) => (
                    <div
                      key={pack.id}
                      className="rounded-lg border border-white/20 p-4 space-y-3"
                    >
                      <h3 className="font-semibold">{pack.name}</h3>
                      <p className="text-2xl font-bold">${pack.price}</p>
                      <p className="text-xs text-muted-foreground">+{pack.credits} SMS credits</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startCheckout("sms_pack", undefined, pack.id)}
                        disabled={!!checkoutLoading}
                      >
                        {checkoutLoading === pack.id ? "Loading..." : "Buy pack"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PortalLayout>
  )
}
