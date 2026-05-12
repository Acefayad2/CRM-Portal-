import type { Metadata } from "next"
import { MarketingHome } from "@/components/marketing/marketing-home"
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

export default function MarketingPage() {
  return <MarketingHome />
}
