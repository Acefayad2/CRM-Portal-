import type { ReactNode } from "react"
import { SiteFooter } from "@/components/site-footer"

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <SiteFooter variant="marketing" />
    </div>
  )
}
