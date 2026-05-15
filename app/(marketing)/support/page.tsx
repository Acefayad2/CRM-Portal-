import Link from "next/link"
import { LifeBuoy, Mail, MessageSquare, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SmsCtaMicrocopy } from "@/components/compliance/sms-consent"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { COMPANY_DISPLAY_NAME, SUPPORT_EMAIL } from "@/lib/site"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support",
  description: `Product support and onboarding for ${COMPANY_DISPLAY_NAME} customers.`,
}

const items = [
  "Workspace setup: seats, roles, pipelines, and imports",
  "SMS and notification configuration aligned with your compliance review",
  "Calendar, meetings, and reminder troubleshooting",
  "Billing, invoices, and enterprise procurement questions",
]

export default function SupportPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <MarketingHeader />
      <div className="border-b bg-muted/15">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Support</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Support built for teams that live in the CRM
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {COMPANY_DISPLAY_NAME} customers receive practical guidance—not generic scripts—so you can resolve blockers
          quickly and keep revenue activities moving.
        </p>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border bg-card p-5 shadow-sm">
            <LifeBuoy className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">Product support</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Accounts, access, integrations, and day-to-day workflow questions.
            </p>
          </article>
          <article className="rounded-2xl border bg-card p-5 shadow-sm">
            <Rocket className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">Onboarding</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Rollout sequencing, data hygiene, and coaching managers on dashboards.
            </p>
          </article>
          <article className="rounded-2xl border bg-card p-5 shadow-sm">
            <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">Messaging readiness</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Help interpreting STOP/HELP flows, consent capture, and disclosure pages.
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">What we can help with</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Primary channel</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-2 inline-flex items-center gap-2 text-lg font-semibold hover:underline"
              >
                <Mail className="h-5 w-5" aria-hidden />
                {SUPPORT_EMAIL}
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                Include workspace name, user emails affected, and timestamps for fastest resolution.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={`mailto:${SUPPORT_EMAIL}`}>Email support</a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact</Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-10 max-w-xl">
          <SmsCtaMicrocopy className="!text-left" />
        </div>
      </div>
    </div>
    </div>
  )
}
