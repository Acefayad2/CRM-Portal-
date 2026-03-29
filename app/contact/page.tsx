import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#020617] px-6 py-20 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Contact</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Let’s set up your sales workspace</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Reach out with your team size, goals, and current process. We’ll help map the best Pantheon setup.
          </p>
        </header>
        <section className="rounded-3xl border border-white/12 bg-white/8 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Email</p>
          <a href="mailto:support@pantheon-portal.com" className="mt-2 inline-block text-lg text-cyan-200 hover:text-cyan-100">
            support@pantheon-portal.com
          </a>
        </section>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11 rounded-full bg-white px-6 text-slate-950 hover:bg-cyan-50">
            <Link href="/auth/login">Portal Login</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-full border-white/16 bg-white/8 px-6 text-white hover:bg-white/14 hover:text-white">
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

