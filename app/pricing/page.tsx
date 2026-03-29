import Link from "next/link"
import { Button } from "@/components/ui/button"

const plans = [
  { name: "Starter", price: "$59/mo", notes: "For solo reps and early-stage teams." },
  { name: "Business", price: "$129/mo", notes: "For growing sales teams that need consistency." },
  { name: "Enterprise", price: "$299/mo", notes: "For larger orgs scaling performance operations." },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#020617] px-6 py-20 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Simple plans for modern sales teams</h1>
          <p className="mt-4 max-w-2xl text-slate-300">Choose a plan that fits your team size and growth pace.</p>
        </header>
        <section className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-3xl border border-white/12 bg-white/8 p-6">
              <h2 className="text-2xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-cyan-200">{plan.price}</p>
              <p className="mt-3 text-sm text-slate-300">{plan.notes}</p>
            </article>
          ))}
        </section>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11 rounded-full bg-white px-6 text-slate-950 hover:bg-cyan-50">
            <Link href="/auth/login">Go To Portal</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-white/16 bg-white/8 px-6 text-white hover:bg-white/14 hover:text-white">
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

