import type { ReactNode } from "react"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { cn } from "@/lib/utils"

type Props = {
  children: ReactNode
  className?: string
}

/** Legal / policy pages: same top nav as the rest of the marketing site, plus a narrow content column. */
export function LegalDocumentShell({ children, className }: Props) {
  return (
    <div className="flex w-full flex-1 flex-col">
      <MarketingHeader />
      <div className={cn("mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12", className)}>{children}</div>
    </div>
  )
}
