"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Pantheon Portal</p>
            <h1 className="mt-4 text-3xl font-semibold">App error</h1>
            <p className="mt-3 text-sm text-slate-300">
              A global rendering error occurred. Retry first. If it keeps happening, reload the app.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200"
              >
                Retry
              </button>
              <a
                href="/portal"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
              >
                Dashboard
              </a>
            </div>
            {error?.digest ? <p className="mt-4 text-xs text-slate-500">Digest: {error.digest}</p> : null}
          </div>
        </div>
      </body>
    </html>
  )
}
