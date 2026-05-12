"use client"

import Link from "next/link"
import { useState } from "react"
import {
  BarChart3,
  Bell,
  Calendar,
  FileText,
  Globe,
  Lock,
  MessageSquare,
  Plus,
  Quote,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SmsCtaMicrocopy } from "@/components/compliance/sms-consent"
import { BUSINESS_POSITIONING, COMPANY_DISPLAY_NAME, smsProgram } from "@/lib/site"

const faqs = [
  {
    question: `What is ${COMPANY_DISPLAY_NAME}?`,
    answer: `${BUSINESS_POSITIONING} Teams use it for CRM records, calendars, meetings, SMS-backed reminders, and audit-friendly consent documentation.`,
  },
  {
    question: "What will I receive text messages about?",
    answer:
      "If you opt in, texts may include appointment reminders, onboarding or account notices, follow-ups tied to your activity, verification codes, and platform updates. We do not sell your number for unrelated third-party marketing.",
  },
  {
    question: "How do I opt out of SMS?",
    answer:
      "Reply STOP to opt out of optional program SMS where supported. Reply HELP for help. You can also email support@pantheonportal.com or use the Contact page. Message frequency may vary; Msg & data rates may apply.",
  },
  {
    question: "How does support work?",
    answer:
      "Email support@pantheonportal.com with your workspace name and issue details. We provide product assistance for billing access, messaging setup, and troubleshooting—not personalized financial or legal advice.",
  },
  {
    question: "Can we keep our existing sales process?",
    answer:
      "Yes. The workspace is designed to map to how your team already sells: stages, scripts, meetings, and client notes stay connected so you strengthen execution without rebuilding your playbook from scratch.",
  },
  {
    question: "How quickly can a team go live?",
    answer:
      "Most teams can configure a workspace and begin tracking leads the same day: invite users, import or add contacts, connect calendars, and align stages to your current funnel.",
  },
  {
    question: "Is my client data sold for marketing?",
    answer:
      "No. We do not sell or rent your phone number or personal information to third parties for their own marketing. See our Privacy Policy for details on processors we use to operate the service (such as messaging carriers).",
  },
]

const useCases = [
  {
    quote:
      "We replaced spreadsheets with Pantheon Portal so every advisor sees the same client story—appointments, notes, and reminders finally live in one auditable place.",
    role: "Managing Principal",
    org: "Regional wealth practice · United States",
  },
  {
    quote:
      "SMS reminders through Pantheon Portal cut our no-show rate without blasting clients—STOP and HELP are documented on their website for compliance.",
    role: "Operations Director",
    org: "Independent insurance agency · United States",
  },
]

const platformPillars = [
  {
    title: "CRM communication",
    body: "Keep calls, SMS, email context, and notes attached to each contact so every teammate sees the full story.",
    icon: MessageSquare,
  },
  {
    title: "Appointment reminders",
    body: "Reduce no-shows with timely reminders tied to your calendar and client records.",
    icon: Calendar,
  },
  {
    title: "Onboarding notifications",
    body: "Guide new hires and clients through the right steps with structured prompts and checkpoints.",
    icon: Bell,
  },
  {
    title: "Team updates",
    body: "Share pipeline changes, wins, and handoffs so leadership and reps stay aligned.",
    icon: Users,
  },
  {
    title: "Client communication",
    body: "Deliver a consistent, professional experience from first touch through renewal.",
    icon: Shield,
  },
]

const featureGrid = [
  { title: "Pipeline clarity", desc: "Stages, owners, and activity in one view.", icon: BarChart3 },
  { title: "Meetings & agendas", desc: "Prepare, present, and log outcomes without tab sprawl.", icon: Sparkles },
  { title: "Scripts & talk tracks", desc: "Centralize messaging so quality stays high at scale.", icon: FileText },
  { title: "Role-based access", desc: "Enterprise-style controls for sensitive client data.", icon: Shield },
  { title: "Performance signals", desc: "Spot stalled deals and coach with evidence.", icon: BarChart3 },
  { title: "Integrated workflows", desc: "Connect reminders, tasks, and client touchpoints.", icon: Globe },
]

export function MarketingHome() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <main>
      <section className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#e8f5e9]/30 via-[#e3f2fd]/30 to-[#f3e5f5]/20" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pb-12 sm:pt-14">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              CRM · SMS · Compliance-ready workflows
            </p>
            <h1 className="text-balance font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
              Pantheon Portal — CRM &amp; client messaging built for financial professionals
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base font-medium leading-relaxed text-foreground md:text-lg">
              {BUSINESS_POSITIONING}
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Run pipeline, appointments, team coordination, and opted-in SMS notifications in one secure SaaS
              workspace—documented for carriers and auditors on{" "}
              <span className="font-medium text-foreground">pantheonportal.com</span>.
            </p>
            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground sm:gap-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1">
                <Lock className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                HTTPS / TLS
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                Role-based access
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1">
                <Server className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                Secure infrastructure
              </span>
            </div>
            <div className="mx-auto mt-8 flex max-w-lg flex-col items-center gap-3">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild className="rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
                  <Link href="/signup">Get started</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-6">
                  <Link href="/contact">Contact sales</Link>
                </Button>
              </div>
              <SmsCtaMicrocopy />
            </div>
          </div>
          <div className="mt-12">
            <DashboardMockup />
          </div>
        </div>
      </section>

      <section
        id="sms-compliance"
        className="scroll-mt-24 border-y bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-14 text-slate-50 sm:px-6"
        aria-labelledby="sms-compliance-heading"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 id="sms-compliance-heading" className="font-serif text-2xl md:text-3xl">
            SMS program disclosure
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">
            Users who provide a mobile number and opt in may receive SMS from {COMPANY_DISPLAY_NAME} for:{" "}
            <strong className="text-white">appointment reminders</strong>,{" "}
            <strong className="text-white">onboarding updates</strong>,{" "}
            <strong className="text-white">account notifications</strong>, and{" "}
            <strong className="text-white">follow-ups</strong> related to the platform and your workspace activity.
          </p>
          <p className="mx-auto mt-6 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white">
            {smsProgram.shortCarrierLine}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/sms-policy" className="text-slate-200 underline underline-offset-4 hover:text-white">
              SMS &amp; communication policy
            </Link>
            <span className="hidden text-slate-600 sm:inline" aria-hidden>
              ·
            </span>
            <Link href="/privacy-policy" className="text-slate-200 underline underline-offset-4 hover:text-white">
              Privacy Policy
            </Link>
            <span className="hidden text-slate-600 sm:inline" aria-hidden>
              ·
            </span>
            <Link href="/terms" className="text-slate-200 underline underline-offset-4 hover:text-white">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </section>

      <section id="platform" className="border-y bg-muted/30 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="mb-4 inline-block rounded-full border bg-background px-4 py-1.5 text-sm font-medium">
              What {COMPANY_DISPLAY_NAME} does
            </span>
            <h2 className="text-balance font-serif text-3xl md:text-4xl">
              One platform for CRM communication and operational SMS
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Purpose-built for financial professionals and agencies: coordinate clients, appointments, CRM-driven
              notifications, and compliant outreach without losing context—or compliance guardrails.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {platformPillars.map(({ title, body, icon: Icon }) => (
              <article
                key={title}
                className="rounded-2xl border bg-background p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-background px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="mb-4 inline-block rounded-full border px-4 py-1.5 text-sm">How it works</span>
            <h2 className="text-balance font-serif text-3xl md:text-4xl lg:text-5xl">
              From first touch to renewal—one workflow
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {COMPANY_DISPLAY_NAME} connects agents, clients, calendars, and compliant messaging so financial firms and
              agencies run a professional, repeatable service motion.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-2xl border bg-card p-6 shadow-sm">
              <MessageSquare className="h-8 w-8 text-primary" aria-hidden />
              <h3 className="mt-4 font-serif text-xl">Agents communicate with clients</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Calls, SMS, email, and notes stay on the contact record—so handoffs between advisors and service teams
                stay accurate and auditable.
              </p>
            </article>
            <article className="rounded-2xl border bg-card p-6 shadow-sm">
              <Calendar className="h-8 w-8 text-primary" aria-hidden />
              <h3 className="mt-4 font-serif text-xl">Appointment reminders</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Calendar-linked reminders reduce no-shows; opted-in SMS reinforces meetings without guessing carrier
                rules—disclosures are published on this site.
              </p>
            </article>
            <article className="rounded-2xl border bg-card p-6 shadow-sm">
              <Bell className="h-8 w-8 text-primary" aria-hidden />
              <h3 className="mt-4 font-serif text-xl">CRM notifications</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Pipeline moves, tasks, and account events surface to the right people so opportunities don&apos;t stall in
                silence.
              </p>
            </article>
            <article className="rounded-2xl border bg-card p-6 shadow-sm">
              <Users className="h-8 w-8 text-primary" aria-hidden />
              <h3 className="mt-4 font-serif text-xl">Team communication</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Shared visibility across producers, ops, and leadership keeps messaging aligned with your compliance and
                brand standards.
              </p>
            </article>
            <article className="rounded-2xl border bg-card p-6 shadow-sm md:col-span-2 xl:col-span-2">
              <Shield className="h-8 w-8 text-primary" aria-hidden />
              <h3 className="mt-4 font-serif text-xl">Customer support workflows</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Structured intake, HELP/STOP handling, and support email ({""}
                <a href="mailto:support@pantheonportal.com" className="font-medium text-primary underline-offset-4 hover:underline">
                  support@pantheonportal.com
                </a>
                ) give users a clear path when something breaks—without exposing client PII in the wrong channel.
              </p>
            </article>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-start">
            <InstructionsCard />
            <DomainCard />
          </div>

          <div className="mt-12 text-center">
            <div className="mx-auto flex max-w-md flex-col items-center gap-2">
              <Button asChild className="rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
                <Link href="/signup">Create your workspace</Link>
              </Button>
              <SmsCtaMicrocopy className="!text-left sm:!text-center" />
            </div>
          </div>

          <div className="mt-16">
            <ChatDemo />
          </div>
        </div>
      </section>

      <section id="features" className="border-t bg-muted/20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl">Built for teams that cannot afford inconsistency</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Enterprise-ready modules your reps will actually use—designed for clarity, speed, and audit-friendly
              workflows.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureGrid.map(({ title, desc, icon: Icon }) => (
              <article key={title} className="rounded-2xl border bg-background p-6">
                <Icon className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="customers" className="border-t bg-background px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl">Use cases from the field</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Representative outcomes financial firms and agencies pursue with {COMPANY_DISPLAY_NAME}.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {useCases.map((uc) => (
              <blockquote
                key={uc.role}
                className="rounded-2xl border bg-card p-8 shadow-sm"
              >
                <Quote className="h-10 w-10 text-primary/40" aria-hidden />
                <p className="mt-4 text-base leading-relaxed text-foreground">&ldquo;{uc.quote}&rdquo;</p>
                <footer className="mt-6 text-sm text-muted-foreground">
                  <cite className="font-semibold not-italic text-foreground">{uc.role}</cite>
                  <span className="block">{uc.org}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="border-t bg-muted/25 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl">Security &amp; trust</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              {COMPANY_DISPLAY_NAME} is built for professional client data—encryption in transit, access controls, and
              clear accountability for who can message whom.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <article className="rounded-2xl border bg-card p-6 text-center shadow-sm">
              <Lock className="mx-auto h-10 w-10 text-primary" aria-hidden />
              <h3 className="mt-4 font-semibold">Secure transport</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Industry-standard TLS for web sessions—protecting login and CRM access over modern browsers.
              </p>
            </article>
            <article className="rounded-2xl border bg-card p-6 text-center shadow-sm">
              <ShieldCheck className="mx-auto h-10 w-10 text-primary" aria-hidden />
              <h3 className="mt-4 font-semibold">CRM governance</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Workspace roles and workflows help teams keep sensitive notes and contact data client-safe by design.
              </p>
            </article>
            <article className="rounded-2xl border bg-card p-6 text-center shadow-sm">
              <Server className="mx-auto h-10 w-10 text-primary" aria-hidden />
              <h3 className="mt-4 font-semibold">Operational discipline</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Audit-friendly messaging policies and published STOP/HELP language support carrier review programs.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="about" className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl">About {COMPANY_DISPLAY_NAME}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {BUSINESS_POSITIONING} We focus on disciplined execution for regulated and relationship-driven businesses:
              clean CRM records, documented SMS consent, and workflows your supervisory chain can inspect.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Our public website at pantheonportal.com hosts Privacy, Terms, SMS policies, and contact information—so
              carriers and compliance teams can verify a complete, professional program during manual review.
            </p>
          </div>
          <div className="rounded-3xl border bg-gradient-to-br from-primary/5 via-background to-muted p-8 shadow-sm">
            <ul className="space-y-4 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span>Single workspace for clients, meetings, and messaging artifacts.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span>Consent-first SMS patterns: STOP, HELP, and clear program descriptions.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span>Documentation hosted on our production domain for reviewer confidence.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t bg-background px-4 py-20 sm:px-6">
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
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <span className="pr-4 text-sm font-medium">{faq.question}</span>
                  <Plus
                    className={`h-4 w-4 shrink-0 transition-transform ${openIndex === index ? "rotate-45" : ""}`}
                  />
                </button>
                {openIndex === index && <div className="pb-5 text-sm leading-relaxed text-muted-foreground">{faq.answer}</div>}
              </div>
            ))}
            <div className="border-t" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e8f5e9]/40 via-[#e3f2fd]/40 to-[#f3e5f5]/30" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="mb-4 font-serif text-3xl md:text-4xl lg:text-5xl">
            Ready to run a cleaner, more compliant revenue operation?
          </h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Start on {COMPANY_DISPLAY_NAME} today, or speak with our team about rollout, training, and SMS registration
            support.
          </p>
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <Button asChild className="rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
              <Link href="/signup">Get started</Link>
            </Button>
            <SmsCtaMicrocopy />
          </div>
        </div>
      </section>
    </main>
  )
}

function InstructionsCard() {
  return (
    <div className="rounded-xl bg-muted/50 p-6">
      <div className="rounded-lg bg-card p-5 shadow-sm">
        <h4 className="mb-4 text-sm font-medium">Playbook</h4>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">Stage</span>
            <div className="mt-2 h-0.5 w-full bg-muted" />
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Talk track</span>
            <div className="mt-2 h-0.5 w-full bg-muted" />
          </div>
        </div>
        <h4 className="mb-3 mt-6 text-sm font-medium">Collateral</h4>
        <div className="flex items-center gap-2 rounded-lg border p-3">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm">Discovery-brief.pdf</span>
        </div>
        <h4 className="mb-3 mt-6 text-sm font-medium">Web intake</h4>
        <div className="flex items-center gap-2 rounded-lg border p-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">lead-intake.pantheonportal.com</span>
        </div>
      </div>
    </div>
  )
}

function DomainCard() {
  return (
    <div className="rounded-xl bg-muted/50 p-6">
      <div className="rounded-lg bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg border p-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">portal.pantheonportal.com</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500">
            <span className="text-xs text-white">✓</span>
          </div>
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Verified workspace domain</span>
        </div>
      </div>
    </div>
  )
}

function ChatDemo() {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#e8f5e9]/50 via-[#e3f2fd]/50 to-[#f3e5f5]/50" />
      <div className="relative rounded-3xl p-6 sm:p-8">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15">
                <span className="text-xs font-bold text-primary">P</span>
              </div>
              <span className="text-sm font-medium">{COMPANY_DISPLAY_NAME} Assistant</span>
            </div>
            <nav className="hidden items-center gap-4 text-muted-foreground md:flex">
              <span className="text-sm">Chat</span>
              <span className="text-sm">Records</span>
              <span className="text-sm">Policies</span>
            </nav>
          </div>
          <div className="p-6 text-center sm:p-8">
            <h2 className="mb-2 text-xl font-semibold">Ask about your pipeline</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Summarize stalled deals, draft follow-up SMS, or pull the next best action for a client—grounded in your
              workspace data.
            </p>
            <div className="mx-auto mb-6 max-w-md">
              <div className="rounded-lg border p-3 text-left">
                <span className="text-sm text-muted-foreground">Which opportunities missed a touch this week?</span>
                <div className="mt-3 flex items-center justify-between border-t pt-2">
                  <span className="text-xs text-muted-foreground">Workspace context attached</span>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Run
                  </span>
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-md space-y-2 text-left text-sm text-muted-foreground">
              <p>Prepare agenda for tomorrow&apos;s executive review.</p>
              <p>Draft a compliant SMS reminder for tomorrow&apos;s appointments.</p>
              <p>Show pipeline health by stage for the West region.</p>
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
      <div className="relative flex items-center gap-2 border-b border-primary/20 bg-card/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex flex-1 justify-center">
          <div className="flex items-center gap-2 rounded-md bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm">
            <Globe className="h-3 w-3" />
            app.pantheonportal.com
          </div>
        </div>
      </div>
      <div className="relative grid gap-4 p-4 sm:grid-cols-3 sm:p-6">
        <div className="rounded-xl border border-primary/15 bg-card/90 p-4 shadow-sm backdrop-blur-sm sm:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pipeline snapshot</p>
          <p className="mt-2 font-serif text-3xl font-semibold tabular-nums">$24.8M</p>
          <p className="text-xs text-muted-foreground">Weighted pipeline · 90-day outlook</p>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
            <div>
              <p className="text-lg font-semibold tabular-nums text-emerald-600">142</p>
              <p className="text-[10px] uppercase text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">38</p>
              <p className="text-[10px] uppercase text-muted-foreground">Meetings</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums text-amber-600">12</p>
              <p className="text-[10px] uppercase text-muted-foreground">Due today</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-primary/15 bg-card/90 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">SMS health</p>
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Program compliant
          </p>
          <p className="mt-2 text-xs leading-snug text-muted-foreground">
            STOP/HELP · consent logs · carrier-ready disclosures on pantheonportal.com
          </p>
        </div>
      </div>
      <div className="relative border-t border-primary/10 bg-card/70 px-4 py-4 text-center sm:px-8">
        <h3 className="text-sm font-semibold">Executive overview</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Live pipeline, meetings, messaging health, and seat usage—built for GTM and compliance leadership.
        </p>
      </div>
    </div>
  )
}
