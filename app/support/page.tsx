import Link from "next/link"
import { Button } from "@/components/ui/button"

const items = [
  "Onboarding support for team setup and workflow migration",
  "Best-practice playbooks for pipeline execution",
  "Help with scheduling, scripts, and meeting operations",
  "Fast troubleshooting for account and access issues",
]

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#020617] px-6 py-20 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Support</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Support built for high-performing sales teams</h1>
          <p className="mt-4 max-w-2xl text-slate-300">From onboarding to scale, we help your team move faster with less friction.</p>
        </header>
        <section className="rounded-3xl border border-white/12 bg-white/8 p-6">
          <ul className="space-y-3 text-slate-200">
            {items.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11 rounded-full bg-white px-6 text-slate-950 hover:bg-cyan-50">
            <a href="mailto:support@pantheon-portal.com">Email Support</a>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-white/16 bg-white/8 px-6 text-white hover:bg-white/14 hover:text-white">
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

