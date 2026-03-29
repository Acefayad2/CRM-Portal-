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

export default function HomePage() {
  const orgLdJson = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pantheon CRM Portal",
    url: "https://pantheon-portal.com",
    description:
      "Pantheon CRM Portal helps sales teams manage pipeline, meetings, calendars, scripts, and team execution in one secure workspace.",
  }

  return (
    <BeamsBackground intensity="strong" className="bg-[#020617] text-white">
      <main className="relative min-h-screen overflow-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLdJson) }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.16),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.24),rgba(2,6,23,0.86))]" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between rounded-full border border-white/12 bg-white/6 px-5 py-3 shadow-[0_12px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-cyan-200/80">
                Pantheon
              </p>
              <p className="text-sm text-white/60">Protect Today. Grow Tomorrow.</p>
            </div>
            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/#features" className="text-sm text-white/75 transition hover:text-white">Features</Link>
              <Link href="/pricing" className="text-sm text-white/75 transition hover:text-white">Pricing</Link>
              <Link href="/support" className="text-sm text-white/75 transition hover:text-white">Support</Link>
              <Link href="/contact" className="text-sm text-white/75 transition hover:text-white">Contact</Link>
            </nav>
            <Button asChild variant="outline" className="border-white/18 bg-white/10 text-white hover:bg-white/16 hover:text-white">
              <Link href="/auth/login">Portal</Link>
            </Button>
          </header>

          <section className="flex flex-1 items-center py-12 sm:py-16 lg:py-20">
            <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100/90 backdrop-blur-xl">
                  <BadgeCheck className="size-4" />
                  Built for modern sales teams inside Pantheon Portal
                </div>

                <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
                  A sharper entry point for the
                  <span className="block bg-gradient-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                    Pantheon Portal
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200/78 sm:text-lg">
                  Manage your pipeline, calendars, scripts, meetings, team collaboration, and
                  follow-up workflows in one secure portal.
                </p>
                <p className="mt-3 max-w-2xl text-sm text-slate-300/90">
                  Sign up to receive appointment reminders, account notifications, and support updates
                  from Pantheon CRM Portal.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-cyan-50"
                  >
                    <Link href="/auth/login">
                      Access Portal
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/16 bg-white/8 px-6 text-white hover:bg-white/14 hover:text-white"
                  >
                    <Link href="/pricing">View Pricing</Link>
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

              <aside className="rounded-[2rem] border border-white/12 bg-white/10 p-6 shadow-[0_18px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/72">
                      Portal Snapshot
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Fast access, stronger execution</h2>
                  </div>
                  <div className="size-3 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.75)]" />
                </div>

                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-sm text-slate-300">Primary route</p>
                    <p className="mt-2 text-lg font-medium text-white">
                      <code className="rounded-md bg-white/8 px-2 py-1 text-base">/portal</code> workspace
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <p className="text-3xl font-semibold text-white">All-in-one</p>
                      <p className="mt-2 text-sm text-slate-300">
                        CRM, meetings, scripts, resources, and team collaboration.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                      <p className="text-3xl font-semibold text-white">Secure</p>
                      <p className="mt-2 text-sm text-slate-300">
                        Authenticated access for the people who actually need the workbench.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-cyan-300/16 bg-cyan-300/8 p-4">
                    <p className="text-sm text-cyan-100/86">Need help getting started? Visit Support or Contact for onboarding help.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="sm" className="h-10 rounded-full bg-white px-4 text-slate-950 hover:bg-cyan-50">
                      <Link href="/support">Support</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="h-10 rounded-full border-white/16 bg-white/8 px-4 text-white hover:bg-white/14 hover:text-white">
                      <Link href="/contact">Contact</Link>
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <section id="sms-signup" className="pb-10">
            <div className="rounded-[2rem] border border-white/12 bg-white/10 p-6 shadow-[0_18px_90px_rgba(2,6,23,0.2)] backdrop-blur-2xl sm:p-8">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Pantheon CRM Portal SMS Program</p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">SMS Signup</h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200/80">
                  Join to receive appointment reminders, account notifications, and support updates from Pantheon CRM Portal.
                </p>
              </div>

              <form className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm text-slate-200">Full name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="h-11 w-full rounded-xl border border-white/20 bg-slate-950/50 px-3 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-300/60"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="text-sm text-slate-200">Phone number</label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    className="h-11 w-full rounded-xl border border-white/20 bg-slate-950/50 px-3 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-300/60"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="email" className="text-sm text-slate-200">Email (optional)</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="h-11 w-full rounded-xl border border-white/20 bg-slate-950/50 px-3 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-cyan-300/60"
                    placeholder="you@company.com"
                  />
                </div>

                <div className="md:col-span-2 rounded-xl border border-white/15 bg-slate-950/45 p-4">
                  <label className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                    <input
                      type="checkbox"
                      name="smsConsent"
                      required
                      className="mt-1 size-4 rounded border-white/30 bg-transparent text-cyan-300"
                    />
                    <span>
                      By checking this box and providing your phone number, you agree to receive text messages
                      from Pantheon CRM Portal regarding appointment reminders, account notifications, and support
                      updates. Message &amp; data rates may apply. Message frequency varies. Reply STOP to opt out.
                      Reply HELP for help.
                    </span>
                  </label>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm">
                    <Link href="/privacy" className="text-cyan-200 underline underline-offset-4 hover:text-cyan-100">
                      Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-cyan-200 underline underline-offset-4 hover:text-cyan-100">
                      Terms &amp; Conditions
                    </Link>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Button type="submit" className="h-11 rounded-full bg-white px-6 text-slate-950 hover:bg-cyan-50">
                    Submit SMS Signup
                  </Button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </BeamsBackground>
  )
}
