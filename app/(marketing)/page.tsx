"use client"

import { Hero } from "@/components/hero"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main>
      <Hero />
      <section id="features" className="relative z-10 container pb-12 md:pb-20">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Client Management", "Track leads, stages, notes, and contact history in one place."],
            ["Smart Follow-Ups", "Spot stale contacts fast and prioritize the next best action."],
            ["Calendar + Scheduling", "Manage appointments and team availability with one view."],
            ["Presentations + Scripts", "Run meetings confidently with proven scripts and guided flows."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="font-sentient text-2xl">{title}</h3>
              <p className="mt-3 font-mono text-sm text-foreground/70">{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="demo" className="relative z-10 container pb-24 md:pb-32">
        <div className="rounded-2xl border border-primary/30 bg-black/60 p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Explore More</p>
          <h2 className="mt-3 font-sentient text-3xl md:text-4xl">Everything your team needs, organized by workflow</h2>
          <p className="mt-4 max-w-2xl font-mono text-sm text-foreground/75">
            Dive into pricing, support capabilities, and contact options through dedicated pages built for quick decision-making.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pricing">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                [View Pricing]
              </Button>
            </Link>
            <Link href="/support">
              <Button size="sm" className="border-primary bg-transparent text-primary hover:bg-primary/10 hover:text-primary">
                [Support]
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="sm" className="border-primary bg-transparent text-primary hover:bg-primary/10 hover:text-primary">
                [Contact]
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
