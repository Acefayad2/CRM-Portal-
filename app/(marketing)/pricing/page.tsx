import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SmsCtaMicrocopy } from "@/components/compliance/sms-consent"
import { COMPANY_DISPLAY_NAME } from "@/lib/site"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description: `Plans and packaging for ${COMPANY_DISPLAY_NAME}.`,
}

const plans = [
  {
    name: "Starter",
    price: "$59",
    period: "/mo",
    notes: "Solo producers and lean pods getting a governed workspace live.",
    features: ["Core CRM & pipeline", "Calendar & reminders", "Email support"],
  },
  {
    name: "Business",
    price: "$129",
    period: "/mo",
    notes: "Growing teams standardizing scripts, meetings, and SMS-backed workflows.",
    features: ["Everything in Starter", "Team seats & roles", "Priority support"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "/mo",
    notes: "Larger orgs with advanced security, onboarding, and compliance review needs.",
    features: ["Everything in Business", "Admin controls", "Implementation guidance"],
  },
]

export default function PricingPage() {
  return (
    <div className="border-b bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Pricing</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Transparent plans for regulated, high-touch sales teams
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Choose a tier that matches your seat count and messaging volume. Annual invoicing and custom paperwork are
          available on request.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col rounded-2xl border bg-card p-6 shadow-sm ${
                plan.highlighted ? "ring-2 ring-primary" : ""
              }`}
            >
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{plan.notes}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 flex max-w-xl flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/signup">Start with {COMPANY_DISPLAY_NAME}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Talk to sales</Link>
            </Button>
          </div>
          <SmsCtaMicrocopy className="!text-left" />
        </div>
      </div>
    </div>
  )
}
