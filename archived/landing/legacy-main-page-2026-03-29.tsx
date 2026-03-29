import Link from "next/link"
import { ArrowRight, BadgeCheck, CalendarDays, Shield, Users } from "lucide-react"
import { BeamsBackground } from "@/components/ui/beams-background"
import { Button } from "@/components/ui/button"

const highlights = [
  {
    title: "Client Operations",
    description: "Track conversations, follow-ups, and next steps in one portal experience.",
    icon: Users,
  },
  {
    title: "Protected Workflows",
    description: "Keep team access, communication, and planning inside a secure workspace.",
    icon: Shield,
  },
  {
    title: "Meeting Ready",
    description: "Move from outreach to scheduling, presentations, and resource delivery faster.",
    icon: CalendarDays,
  },
]

// Archived copy of the previous root landing page.
export default function LegacyMainPageArchive() {
  return (
    <BeamsBackground intensity="strong" className="bg-[#020617] text-white">
      <main className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.16),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.24),rgba(2,6,23,0.86))]" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between rounded-full border border-white/12 bg-white/6 px-5 py-3 shadow-[0_12px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-cyan-200/80">Pantheon</p>
              <p className="text-sm text-white/60">Protect Today. Grow Tomorrow.</p>
            </div>

            <Button asChild variant="outline" className="border-white/18 bg-white/10 text-white hover:bg-white/16 hover:text-white">
              <Link href="/login?next=/portal">Sign In</Link>
            </Button>
          </header>

          <section className="flex flex-1 items-center py-12 sm:py-16 lg:py-20">
            <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100/90 backdrop-blur-xl">
                  <BadgeCheck className="size-4" />
                  Built for modern teams inside Pantheon Portal
                </div>

                <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
                  A sharper entry point for the
                  <span className="block bg-gradient-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                    Pantheon Portal
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200/78 sm:text-lg">
                  Give your team a premium front door into scheduling, client management,
                  training resources, and day-to-day execution, all in one focused workspace.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg" className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-cyan-50">
                    <Link href="/login?next=/portal">
                      Access Portal
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>

                  <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-white/16 bg-white/8 px-6 text-white hover:bg-white/14 hover:text-white">
                    <Link href="/portal">Open Dashboard</Link>
                  </Button>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {highlights.map(({ title, description, icon: Icon }) => (
                    <div
                      key={title}
                      className="rounded-3xl border border-white/12 bg-white/8 p-5 shadow-[0_16px_70px_rgba(2,6,23,0.22)] backdrop-blur-xl"
                    >
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                        <Icon className="size-5" />
                      </div>
                      <h2 className="mt-4 text-lg font-medium text-white">{title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-200/72">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </BeamsBackground>
  )
}
