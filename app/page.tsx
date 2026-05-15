import type { Metadata } from "next"
import { MarketingHome } from "@/components/marketing/marketing-home"
import { SiteFooter } from "@/components/site-footer"
import { BUSINESS_POSITIONING, COMPANY_DISPLAY_NAME, SITE_ORIGIN } from "@/lib/site"

const canonical = SITE_ORIGIN

export const metadata: Metadata = {
  title: "CRM & client messaging for financial professionals",
  description: BUSINESS_POSITIONING,
  alternates: { canonical },
  openGraph: {
    title: `${COMPANY_DISPLAY_NAME} | CRM & SMS for financial professionals`,
    description: BUSINESS_POSITIONING,
    url: canonical,
    siteName: COMPANY_DISPLAY_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY_DISPLAY_NAME} | CRM & SMS for financial professionals`,
    description: BUSINESS_POSITIONING,
  },
}

/** Root `/` — lives here (not only under a route group) so every host/preview resolves the landing page reliably. */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex min-h-0 flex-1 flex-col">
        <MarketingHome />
      </div>
      <SiteFooter variant="marketing" />
    </div>
  )
}
