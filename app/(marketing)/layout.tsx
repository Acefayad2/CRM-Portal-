import type { ReactNode } from "react"
import { Header } from "@/components/header"
import { SiteLegalFooter } from "@/components/site-legal-footer"

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="landing-theme flex min-h-screen flex-col bg-black text-white">
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      <div className="container pb-10 pt-16">
        <SiteLegalFooter variant="marketing" />
      </div>
    </div>
  )
}
