"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, TrendingUp, Users, Calendar, Zap, BarChart3, Lock } from "lucide-react"

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const features = [
    {
      icon: Shield,
      title: "Client Management",
      description: "Organize and track all your clients in one secure, centralized hub. Never lose a lead again.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingUp,
      title: "Pipeline Tracking",
      description: "Visual pipeline management from New Lead to Follow-Up. Know exactly where each opportunity stands.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Calendar,
      title: "Team Calendars",
      description: "Coordinate schedules and share availability with your entire team. Schedule like a pro.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Zap,
      title: "Sales Scripts",
      description: "Access proven scripts for cold calls, objection handling, and follow-ups. Close more deals.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with shared resources and team-based subscriptions.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track metrics that matter. Real-time insights into your pipeline and performance.",
      color: "from-indigo-500 to-blue-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Pantheon
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-white/70 hover:text-white transition">Features</Link>
              <Link href="#trial" className="text-white/70 hover:text-white transition">Pricing</Link>
              <Link href="/auth/login" className="text-white/70 hover:text-white transition">Login</Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                  Try Free for 2 Weeks
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-white/10 border border-white/20 rounded-full">
            <p className="text-sm text-cyan-400 font-semibold">🎁 New Users Get 2 Weeks Free</p>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Protect Today.<br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Grow Tomorrow.
            </span>
          </h1>

          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            The all-in-one CRM platform built for insurance and financial services agents. Manage clients, track your pipeline, and close more deals with your entire team.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-lg h-14 px-8">
                Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-lg h-14 px-8">
                Learn More
              </Button>
            </Link>
          </div>

          <p className="text-sm text-white/50">
            ✓ No credit card required • ✓ 14-day free trial • ✓ Full feature access
          </p>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 mx-auto max-w-5xl">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 p-6">
              <div className="grid grid-cols-3 gap-4 h-full">
                <div className="col-span-2 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs text-white/50 mb-3">Pipeline Snapshot</p>
                  <div className="space-y-2">
                    <div className="h-3 rounded bg-cyan-500/40 w-4/5" />
                    <div className="h-3 rounded bg-blue-500/40 w-3/5" />
                    <div className="h-3 rounded bg-purple-500/40 w-2/3" />
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="rounded-md border border-white/10 bg-white/5 p-2 text-center text-xs text-white/70">New 24</div>
                    <div className="rounded-md border border-white/10 bg-white/5 p-2 text-center text-xs text-white/70">Calls 12</div>
                    <div className="rounded-md border border-white/10 bg-white/5 p-2 text-center text-xs text-white/70">Closed 6</div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs text-white/50 mb-3">Today</p>
                  <div className="space-y-2 text-xs text-white/70">
                    <div className="rounded-md bg-white/5 px-2 py-1">10:00 Team Sync</div>
                    <div className="rounded-md bg-white/5 px-2 py-1">12:30 Client Call</div>
                    <div className="rounded-md bg-white/5 px-2 py-1">3:00 Follow-up</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Powerful features designed specifically for insurance and financial services professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative p-8 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                >
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-2 mb-4`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white/60">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trial Section */}
      <section id="trial" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm text-cyan-300 font-semibold">Simple Pricing</p>
          <h3 className="mt-2 text-3xl font-bold text-white">2 Weeks Free. Then decide.</h3>
          <p className="mt-3 text-white/70">
            Get full feature access during your 14-day trial. No credit card required to start.
          </p>
          <div className="mt-6">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                Activate Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/60 text-sm">
            <p>&copy; 2026 Pantheon. All rights reserved.</p>
            <p>Protect Today. Grow Tomorrow.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
