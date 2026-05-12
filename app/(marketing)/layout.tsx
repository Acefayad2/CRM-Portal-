import type { ReactNode } from "react"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { SiteFooter } from "@/components/site-footer"

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketingHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter variant="marketing" />
    </div>
  )
}
