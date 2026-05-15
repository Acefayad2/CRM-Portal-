import Link from "next/link"
import { Building2, Headphones, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SmsCtaMicrocopy } from "@/components/compliance/sms-consent"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import {
  COMPANY_DISPLAY_NAME,
  SITE_ORIGIN,
  SUPPORT_EMAIL,
  getServiceRegion,
  getSupportPhoneDisplay,
} from "@/lib/site"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${COMPANY_DISPLAY_NAME} for sales, support, and partnership inquiries.`,
}

export default function ContactPage() {
  const phone = getSupportPhoneDisplay()
  const region = getServiceRegion()

  return (
    <div className="flex w-full flex-1 flex-col">
      <MarketingHeader />
      <div className="border-b bg-muted/25">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">Contact</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">We respond to serious teams</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Reach {COMPANY_DISPLAY_NAME} for product questions, security review packets, billing, or SMS program documentation.
          Include your company name, expected seat count, and timeline so we can route you quickly.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="h-4 w-4" aria-hidden />
              Business email
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-3 block text-lg font-medium text-primary underline-offset-4 hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
            <p className="mt-2 text-sm text-muted-foreground">
              Primary channel for procurement, legal, and technical questions.
            </p>
          </section>

          {phone && (
            <section className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Phone className="h-4 w-4" aria-hidden />
                Phone
              </div>
              <a href={`tel:${phone.replace(/\D/g, "")}`} className="mt-3 block text-lg font-medium hover:underline">
                {phone}
              </a>
              <p className="mt-2 text-sm text-muted-foreground">Business hours availability; voicemail supported.</p>
            </section>
          )}

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" aria-hidden />
              Service region
            </div>
            <p className="mt-3 text-base font-medium text-foreground">{region}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {COMPANY_DISPLAY_NAME} serves U.S.-based financial professionals and agencies; set{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_SERVICE_REGION</code> in production if
              your go-to-market area differs.
            </p>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="h-4 w-4" aria-hidden />
              Company
            </div>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{COMPANY_DISPLAY_NAME}</strong> delivers a CRM and communications
              workspace for organizations that coordinate clients, appointments, onboarding, and compliant SMS. Our
              public site and policies are hosted at{" "}
              <a href={SITE_ORIGIN} className="font-medium text-primary underline-offset-4 hover:underline">
                {SITE_ORIGIN.replace(/^https:\/\//, "")}
              </a>{" "}
              to align with carrier and 10DLC review expectations.
            </p>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm md:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Headphones className="h-4 w-4" aria-hidden />
              Support
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Existing customers should email {SUPPORT_EMAIL} with workspace identifiers, screenshots, and steps to
              reproduce. For enablement resources and FAQs, visit our Support center.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <a href={`mailto:${SUPPORT_EMAIL}`}>Email us</a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/support">Support center</Link>
              </Button>
            </div>
          </section>
        </div>

        <div className="mx-auto mt-10 max-w-xl">
          <SmsCtaMicrocopy className="!text-left" />
        </div>
      </div>
    </div>
    </div>
  )
}
