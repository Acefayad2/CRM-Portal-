/** Public site identity — use for 10DLC / marketing consistency (pantheonportal.com). */
export const SITE_ORIGIN = "https://pantheonportal.com" as const

export const COMPANY_DISPLAY_NAME = "Pantheon Portal" as const

/** Exact positioning statement for carrier / brand verification (use verbatim on marketing). */
export const BUSINESS_POSITIONING =
  "Pantheon Portal is a CRM and client communication platform for financial professionals and agencies." as const

/** Shown in footers and legal copy. Adjust if your registered legal name differs. */
export const COMPANY_LEGAL_NAME = COMPANY_DISPLAY_NAME

export const SUPPORT_EMAIL = "support@pantheonportal.com" as const

/** Primary geography served (override with NEXT_PUBLIC_SERVICE_REGION). */
export function getServiceRegion(): string {
  return process.env.NEXT_PUBLIC_SERVICE_REGION?.trim() || "United States"
}

export type SocialLink = { label: string; href: string }

/** Optional social URLs for footer — set NEXT_PUBLIC_SOCIAL_LINKEDIN, _TWITTER_X, _FACEBOOK. */
export function getSocialLinks(): SocialLink[] {
  const out: SocialLink[] = []
  const li = process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN?.trim()
  const x = process.env.NEXT_PUBLIC_SOCIAL_TWITTER_X?.trim()
  const fb = process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK?.trim()
  if (li) out.push({ label: "LinkedIn", href: li })
  if (x) out.push({ label: "X (Twitter)", href: x })
  if (fb) out.push({ label: "Facebook", href: fb })
  return out
}

/** Optional business phone for Contact page and footer; set in env for production. */
export function getSupportPhoneDisplay(): string | null {
  const v = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim()
  return v && v.length > 0 ? v : null
}

export const smsProgram = {
  /** Typical range for campaign disclosure — actual frequency varies by account. */
  frequencyDisclosure:
    "Message frequency varies based on your account activity, reminders you enable, and system notifications. Many accounts receive fewer than 10 SMS messages per month; active workspaces may receive more.",
  /** Short line for CTAs and SMS registration — carrier-friendly wording. */
  shortCarrierLine:
    "Message frequency may vary. Msg & data rates may apply. Reply STOP to opt out, HELP for help.",
} as const
