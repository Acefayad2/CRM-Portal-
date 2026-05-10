"use client"

import Link from "next/link"
import { useState } from "react"
import { FileText, Globe, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const faqs = [
  {
    question: "What is Pantheon CRM Portal and who is it for?",
    answer:
      "Pantheon CRM Portal is a client and pipeline platform for sales-driven teams. It helps you track leads, run meetings, manage follow-up, and keep your team aligned from first contact to closed deal.",
  },
  {
    question: "Can I use Pantheon with my current sales workflow?",
    answer:
      "Yes. Pantheon is built to fit existing outreach and client workflows. You can organize your pipeline stages, meeting notes, scripts, and scheduling in one place without rebuilding your process from scratch.",
  },
  {
    question: "How quickly can my team get started?",
    answer:
      "Most teams can get started in a single day. Create your workspace, invite teammates, add leads, and begin tracking activity immediately with a clear dashboard and guided workflow.",
  },
]

export default function Home() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 rounded-full bg-black px-4 py-2">
          <Logo className="h-5 w-[96px]" />
          <span className="hidden text-xs uppercase tracking-[0.2em] text-white/70 md:inline">CRM Portal</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/support" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Support
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <section className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#e8f5e9]/30 via-[#e3f2fd]/30 to-[#f3e5f5]/20" />
        <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
              Build stronger client relationships with one modern CRM workspace
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Pantheon helps your team manage leads, meetings, scripts, and follow-up in one place so every
              conversation moves deals forward.
            </p>
            <Button className="mt-8 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
              Start Free
            </Button>
          </div>
          <div className="mt-12">
            <DashboardMockup />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-background px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-20 text-center">
            <span className="mb-6 inline-block rounded-full border px-4 py-1.5 text-sm">How it works</span>
            <h2 className="text-balance font-serif text-3xl md:text-4xl lg:text-5xl">
              The clearest way to
              <br />
              run your sales operation
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Replace scattered tools with one platform that keeps your team focused, accountable, and client-ready.
            </p>
          </div>

          <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <h3 className="mb-4 font-serif text-2xl md:text-3xl">1. Capture every lead and touchpoint</h3>
              <p className="leading-relaxed text-muted-foreground">
                Keep contact details, pipeline stage, last activity, and notes together so no opportunity gets lost
                between calls, texts, and meetings.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <InstructionsCard />
            </div>
          </div>

          <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
            <BrandCard />
            <div>
              <h3 className="mb-4 font-serif text-2xl md:text-3xl">2. Standardize your team workflow</h3>
              <p className="leading-relaxed text-muted-foreground">
                Use shared scripts, templates, and consistent stages so your team delivers a reliable client
                experience at every step.
              </p>
            </div>
          </div>

          <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <h3 className="mb-4 font-serif text-2xl md:text-3xl">3. Schedule and run better meetings</h3>
              <p className="leading-relaxed text-muted-foreground">
                Coordinate calendars, prepare with structured talking points, and keep follow-up actions connected to
                the right contact records.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <DomainCard />
            </div>
          </div>

          <div className="mb-24 grid items-center gap-12 md:grid-cols-2">
            <PaymentsCard />
            <div>
              <h3 className="mb-4 font-serif text-2xl md:text-3xl">4. Track performance and close faster</h3>
              <p className="leading-relaxed text-muted-foreground">
                Monitor activity, spot stalled deals early, and coach your team with real pipeline visibility.
              </p>
            </div>
          </div>

          <div className="mb-16 text-center">
            <h3 className="mb-4 font-serif text-2xl md:text-3xl">5. Scale with confidence</h3>
            <p className="mx-auto mb-6 max-w-lg text-muted-foreground">
              As your book grows, Pantheon gives you the structure to protect service quality while increasing
              conversion and retention.
            </p>
            <Button className="rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
              Book a Demo
            </Button>
          </div>

          <ChatDemo />
        </div>
      </section>

      <section className="bg-background px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
          <h2 className="font-serif text-3xl md:text-4xl">
            Frequently asked
            <br />
            questions
          </h2>
          <div>
            {faqs.map((faq, index) => (
              <div key={faq.question} className="border-t">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <span className="pr-4 text-sm">{faq.question}</span>
                  <Plus className={`h-4 w-4 flex-shrink-0 transition-transform ${openIndex === index ? "rotate-45" : ""}`} />
                </button>
                {openIndex === index && <div className="pb-5 text-sm text-muted-foreground">{faq.answer}</div>}
              </div>
            ))}
            <div className="border-t" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e8f5e9]/40 via-[#e3f2fd]/40 to-[#f3e5f5]/30" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="mb-4 font-serif text-3xl md:text-4xl lg:text-5xl">Bring your entire sales workflow into one portal</h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Give your team one place to manage clients, run meetings, and execute consistent follow-up.
          </p>
          <Button className="rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">Start Free</Button>
        </div>
      </section>

      <footer className="border-t bg-background px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-12 flex flex-wrap gap-6">
            <Link href="#" className="text-sm transition-colors hover:text-muted-foreground">
              Use cases
            </Link>
            <Link href="#" className="text-sm transition-colors hover:text-muted-foreground">
              Pricing
            </Link>
            <Link href="#" className="text-sm transition-colors hover:text-muted-foreground">
              Blog
            </Link>
            <Link href="/contact" className="text-sm transition-colors hover:text-muted-foreground">
              Contact
            </Link>
            <Link href="#" className="text-sm transition-colors hover:text-muted-foreground">
              About
            </Link>
            <Link href="#" className="text-sm transition-colors hover:text-muted-foreground">
              Help center
            </Link>
          </nav>
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <p className="text-sm text-muted-foreground">© 2026 Pantheon CRM Portal. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/privacy-policy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="overflow-hidden text-center">
            <h2 className="font-serif text-[5rem] font-light lowercase leading-none tracking-tight text-accent md:text-[10rem] lg:text-[13rem]">
              pantheon
            </h2>
          </div>
        </div>
      </footer>
    </main>
  )
}

function InstructionsCard() {
  return (
    <div className="rounded-xl bg-muted/50 p-6">
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h4 className="mb-4 text-sm font-medium">Instructions</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Role</label>
            <div className="mt-2 h-0.5 w-full bg-muted" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Personality</label>
            <div className="mt-2 h-0.5 w-full bg-muted" />
          </div>
        </div>
        <h4 className="mb-3 mt-6 text-sm font-medium">Files</h4>
        <div className="flex items-center gap-2 rounded-lg border p-3">
          <FileText className="h-4 w-4 text-purple-500" />
          <span className="text-sm">Report.pdf</span>
        </div>
        <h4 className="mb-3 mt-6 text-sm font-medium">Website</h4>
        <div className="flex items-center gap-2 rounded-lg border p-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">lead-intake.pantheoncrm.com</span>
        </div>
      </div>
    </div>
  )
}

function BrandCard() {
  return (
    <div className="rounded-xl bg-muted/50 p-6">
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <span className="font-bold text-purple-500">A</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Upload className="h-4 w-4" />
            Upload logo
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Background</span>
            <div className="h-8 w-8 rounded-full border bg-gray-100" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Accent</span>
            <div className="h-8 w-8 rounded-full bg-purple-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DomainCard() {
  return (
    <div className="rounded-xl bg-muted/50 p-6">
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg border p-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">portal.pantheoncrm.com</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
            <span className="text-xs text-white">✓</span>
          </div>
          <span className="text-sm text-green-600">Domain connected</span>
        </div>
      </div>
    </div>
  )
}

function PaymentsCard() {
  return (
    <div className="rounded-xl bg-muted/50 p-6">
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xl font-bold italic text-purple-500">stripe</span>
          <Button variant="outline" size="sm">
            Connect Stripe
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="rounded-lg border px-3 py-1.5 text-sm">100 messages</span>
            <span className="rounded-lg border px-3 py-1.5 text-sm">$4.00/mo</span>
            <span className="text-sm font-medium text-green-500">+$1.00</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border px-3 py-1.5 text-sm">200 messages</span>
            <span className="rounded-lg border px-3 py-1.5 text-sm">$8.00/mo</span>
            <span className="text-sm font-medium text-green-500">+$2.00</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-4 gap-1 bg-transparent">
          <span>+</span> Add plan
        </Button>
      </div>
    </div>
  )
}

function ChatDemo() {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#e8f5e9]/50 via-[#e3f2fd]/50 to-[#f3e5f5]/50" />
      <div className="relative rounded-3xl p-8">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100">
                <span className="text-xs font-bold text-purple-500">A</span>
              </div>
              <span className="text-sm font-medium">Pantheon Assistant</span>
            </div>
            <nav className="hidden items-center gap-4 md:flex">
              <span className="text-sm text-muted-foreground">Chat</span>
              <span className="text-sm text-muted-foreground">About</span>
              <span className="text-sm text-muted-foreground">Pricing</span>
              <span className="text-sm text-muted-foreground">Log in</span>
              <button className="rounded-full bg-purple-500 px-3 py-1 text-xs text-white">Sign up</button>
            </nav>
          </div>
          <div className="p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold">How can I help?</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Ready to get fit? Ask me about exercises, diet,
              <br />
              or how to build the perfect routine for you.
            </p>
            <div className="mx-auto mb-6 max-w-md">
              <div className="rounded-lg border p-3">
                <input type="text" placeholder="Ask anything" className="w-full text-sm outline-none" />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>📎</span> 0 Files
                  </div>
                  <button className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500">
                    <span className="text-xs text-white">↑</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-md space-y-2 text-left">
              <p className="text-sm text-muted-foreground">Quick healthy breakfast?</p>
              <p className="text-sm text-muted-foreground">Best stretch for back pain?</p>
              <p className="text-sm text-muted-foreground">Easy home workouts?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-primary/20 shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#e8f5e9]/70 via-[#e3f2fd]/65 to-[#f3e5f5]/60" />
      <div className="relative flex items-center gap-2 border-b border-primary/20 bg-white/70 px-4 py-3 backdrop-blur-sm">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex flex-1 justify-center">
          <div className="flex items-center gap-2 rounded-md bg-white/80 px-3 py-1 text-xs text-muted-foreground shadow-sm">
            <Globe className="h-3 w-3" />
            app.pantheoncrm.com
          </div>
        </div>
      </div>
      <div className="relative flex p-8 text-center">
        <div className="w-full rounded-xl border border-primary/15 bg-white/75 p-8 shadow-sm backdrop-blur-sm">
          <h3 className="text-xl font-medium">Dashboard Preview</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure branding, domains, and monetization from one control panel.
          </p>
        </div>
      </div>
    </div>
  )
}
