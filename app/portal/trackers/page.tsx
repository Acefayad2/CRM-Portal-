"use client"

import { Activity, ListChecks, Target } from "lucide-react"
import { PortalLayout } from "@/components/portal-layout"

const trackerCards = [
  {
    title: "Pipeline Tracker",
    description: "Monitor lead movement across stages and quickly identify bottlenecks.",
    icon: Target,
  },
  {
    title: "Follow-Up Tracker",
    description: "Stay on top of outreach tasks and overdue client follow-ups.",
    icon: ListChecks,
  },
  {
    title: "Performance Tracker",
    description: "Track activity trends and outcomes to coach better and close faster.",
    icon: Activity,
  },
]

export default function TrackersPage() {
  return (
    <PortalLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Trackers</h1>
          <p className="mt-1 text-muted-foreground">
            Central place for tracking team execution, follow-up, and pipeline performance.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {trackerCards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-slate-300/70 bg-white/90 p-5 shadow-sm">
              <card.icon className="h-5 w-5 text-slate-700" />
              <h2 className="mt-3 text-lg font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{card.description}</p>
            </article>
          ))}
        </section>
      </div>
    </PortalLayout>
  )
}
