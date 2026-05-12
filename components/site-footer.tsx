import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  COMPANY_DISPLAY_NAME,
  COMPANY_LEGAL_NAME,
  SITE_ORIGIN,
  SUPPORT_EMAIL,
  getServiceRegion,
  getSocialLinks,
  getSupportPhoneDisplay,
} from "@/lib/site"

export type SiteFooterVariant = "portal" | "marketing" | "legal" | "auth"

const shell: Record<SiteFooterVariant, string> = {
  portal: "border-slate-300/50 bg-slate-950/40 text-slate-300",
  marketing: "border-border bg-muted/40 text-muted-foreground",
  legal: "border-zinc-200 bg-zinc-100/80 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400",
  auth: "border-white/10 bg-black/40 text-white/70",
}

const linkClass: Record<SiteFooterVariant, string> = {
  portal: "text-slate-400 hover:text-white",
  marketing: "text-foreground/80 hover:text-foreground",
  legal: "text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white",
  auth: "text-white/80 hover:text-white",
}

const brandClass: Record<SiteFooterVariant, string> = {
  portal: "text-slate-100",
  marketing: "text-foreground",
  legal: "text-zinc-900 dark:text-white",
  auth: "text-white",
}

export function SiteFooter({
  variant = "marketing",
  className,
}: {
  variant?: SiteFooterVariant
  className?: string
}) {
  const phone = getSupportPhoneDisplay()
  const region = getServiceRegion()
  const social = getSocialLinks()

  return (
    <footer
      role="contentinfo"
      className={cn("border-t", shell[variant], className)}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:py-12">
        <div className="flex flex-col gap-2">
          <p className={cn("text-sm font-semibold tracking-tight", brandClass[variant])}>{COMPANY_LEGAL_NAME}</p>
          <p className="max-w-prose text-sm leading-relaxed opacity-90">
            {COMPANY_DISPLAY_NAME} is a CRM and client communication platform for financial professionals and agencies.
            Primary service region: <span className="font-medium text-foreground/90">{region}</span>.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 text-sm">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className={cn("w-fit font-medium underline-offset-4 hover:underline", linkClass[variant])}
            >
              {SUPPORT_EMAIL}
            </a>
            {phone && (
              <a href={`tel:${phone.replace(/\D/g, "")}`} className={cn("w-fit", linkClass[variant])}>
                {phone}
              </a>
            )}
            <a href={SITE_ORIGIN} className={cn("w-fit text-xs opacity-80", linkClass[variant])}>
              {SITE_ORIGIN.replace(/^https:\/\//, "")}
            </a>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Legal and policies">
            <Link href="/privacy-policy" className={cn(linkClass[variant])}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={cn(linkClass[variant])}>
              Terms &amp; Conditions
            </Link>
            <Link href="/sms-policy" className={cn(linkClass[variant])}>
              SMS policy
            </Link>
            <Link href="/policy/twilio" className={cn(linkClass[variant])}>
              Carriers
            </Link>
            <Link href="/contact" className={cn(linkClass[variant])}>
              Contact
            </Link>
            <Link href="/support" className={cn(linkClass[variant])}>
              Support
            </Link>
          </nav>
        </div>

        {social.length > 0 && (
          <nav className="flex flex-wrap gap-4 text-sm" aria-label="Social">
            {social.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(linkClass[variant])}
              >
                {s.label}
              </a>
            ))}
          </nav>
        )}

        <p className="text-xs opacity-80">
          © {new Date().getFullYear()} {COMPANY_LEGAL_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
