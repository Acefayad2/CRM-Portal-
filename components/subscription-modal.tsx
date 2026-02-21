"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const PLANS = [
  {
    id: "team",
    name: "Team",
    description: "For small teams getting started",
    features: ["Up to 5 team members", "Basic CRM", "Calendar sync", "Email support"],
    cta: "Get started",
  },
  {
    id: "business",
    name: "Business",
    description: "For growing organizations",
    features: ["Up to 25 team members", "Advanced CRM", "SMS notifications", "Priority support"],
    cta: "Get started",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large-scale operations",
    features: ["Unlimited team members", "Custom integrations", "Dedicated support", "API access"],
    cta: "Contact sales",
  },
] as const

interface SubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionModal({ open, onOpenChange }: SubscriptionModalProps) {
  const router = useRouter()

  function handleClose(open: boolean) {
    onOpenChange(open)
    if (!open) {
      router.replace("/portal", { scroll: false })
    }
  }

  function handleSelect(planId: string) {
    // TODO: Wire to checkout or contact flow
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose your subscription</DialogTitle>
          <DialogDescription>
            Select a plan that fits your needs. You can change or upgrade later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-3 gap-6 py-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              <ul className="mt-4 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6"
                onClick={() => handleSelect(plan.id)}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground pt-2">
          Choose later? You can always pick a plan from{" "}
          <Link href="/portal/settings/billing" className="text-primary underline">Billing</Link>.
        </p>
      </DialogContent>
    </Dialog>
  )
}
