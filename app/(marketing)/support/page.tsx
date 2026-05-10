import Link from "next/link"
import { LifeBuoy, Mail, MessageSquare, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const items = [
  "Onboarding support for team setup and workflow migration",
  "Best-practice playbooks for pipeline execution",
  "Help with scheduling, scripts, and meeting operations",
  "Fast troubleshooting for account and access issues",
]

export default function SupportPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-16 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#e8f5e9]/70 via-[#e3f2fd]/65 to-[#f3e5f5]/60" />
      <div className="relative mx-auto max-w-5xl space-y-10">
        <header className="space-y-5">
          <Link href="/" className="inline-flex items-center gap-3 rounded-full bg-black px-4 py-2">
            <Logo className="h-5 w-[96px]" />
            <span className="hidden text-xs uppercase tracking-[0.2em] text-white/70 md:inline">CRM Portal</span>
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Support</p>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">Support built for high-performing sales teams</h1>
          <p className="max-w-2xl text-slate-600">
            From onboarding to scale, our team helps you resolve blockers fast and keep your workflow moving.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-300/70 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
            <LifeBuoy className="h-5 w-5 text-slate-700" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Product Support</h2>
            <p className="mt-2 text-sm text-slate-600">Get help with account issues, access, settings, and day-to-day platform usage.</p>
          </article>
          <article className="rounded-2xl border border-slate-300/70 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
            <Rocket className="h-5 w-5 text-slate-700" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Onboarding Help</h2>
            <p className="mt-2 text-sm text-slate-600">Set up your workspace, stages, and workflows with guided recommendations.</p>
          </article>
          <article className="rounded-2xl border border-slate-300/70 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
            <MessageSquare className="h-5 w-5 text-slate-700" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Best-Practice Guidance</h2>
            <p className="mt-2 text-sm text-slate-600">Get practical playbooks for follow-up, scheduling, and team consistency.</p>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-300/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-slate-900">What we can help with</h3>
          <ul className="mt-4 space-y-3 text-slate-700">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-300/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Primary Channel</p>
              <a
                href="mailto:support@pantheon-portal.com"
                className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-slate-900 hover:text-slate-700"
              >
                <Mail className="h-5 w-5" />
                support@pantheon-portal.com
              </a>
              <p className="mt-2 text-sm text-slate-600">Share your workspace details and issue summary for faster support.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-full bg-slate-900 px-6 text-white hover:bg-slate-800">
                <a href="mailto:support@pantheon-portal.com">Email Support</a>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full border-slate-300 bg-white px-6 text-slate-800 hover:bg-slate-100 hover:text-slate-900">
                <Link href="/">Back Home</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
