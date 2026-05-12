import Link from "next/link"
import type { ReactNode } from "react"
import { SiteFooter } from "@/components/site-footer"

type Props = {
  children: ReactNode
}

/** Shared chrome for public legal pages (10DLC / Twilio compliance). */
export function LegalDocumentShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-900 hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
          >
            Pantheon Portal
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">{children}</div>

      <SiteFooter variant="legal" />
    </div>
  )
}
