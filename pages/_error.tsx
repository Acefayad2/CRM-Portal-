import type { NextPageContext } from "next"
import Link from "next/link"

interface ErrorPageProps {
  statusCode?: number
}

function getMessage(statusCode?: number) {
  if (statusCode === 404) {
    return "The page you tried to open doesn't exist or the link has expired."
  }

  return "Something went wrong while loading this page."
}

export default function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-50">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Pantheon Portal</p>
        <h1 className="mt-4 text-3xl font-semibold">
          {statusCode === 404 ? "Page not found" : "Internal Server Error"}
        </h1>
        <p className="mt-3 text-sm text-slate-300">{getMessage(statusCode)}</p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
          >
            Go to login
          </Link>
          <Link
            href="/portal"
            className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
          >
            Open portal
          </Link>
        </div>
      </div>
    </main>
  )
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500
  return { statusCode }
}
