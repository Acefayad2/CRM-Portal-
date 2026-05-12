import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"
import { COMPANY_DISPLAY_NAME } from "@/lib/site"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">{COMPANY_DISPLAY_NAME}</p>
          <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
          <p className="mt-3 text-sm text-slate-300">
            The page you tried to open does not exist or the link has expired.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
            >
              Back to home
            </Link>
            <Link
              href="/portal"
              className="inline-flex rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
            >
              Open portal
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter variant="auth" />
    </div>
  )
}
