/** Common countries with dial codes for phone input */
export const COUNTRY_DIAL_CODES: { code: string; dial: string; name: string }[] = [
  { code: "US", dial: "1", name: "United States" },
  { code: "CA", dial: "1", name: "Canada" },
  { code: "GB", dial: "44", name: "United Kingdom" },
  { code: "AU", dial: "61", name: "Australia" },
  { code: "DE", dial: "49", name: "Germany" },
  { code: "FR", dial: "33", name: "France" },
  { code: "ES", dial: "34", name: "Spain" },
  { code: "IT", dial: "39", name: "Italy" },
  { code: "MX", dial: "52", name: "Mexico" },
  { code: "BR", dial: "55", name: "Brazil" },
  { code: "IN", dial: "91", name: "India" },
  { code: "CN", dial: "86", name: "China" },
  { code: "JP", dial: "81", name: "Japan" },
  { code: "KR", dial: "82", name: "South Korea" },
  { code: "PH", dial: "63", name: "Philippines" },
  { code: "NL", dial: "31", name: "Netherlands" },
  { code: "PL", dial: "48", name: "Poland" },
  { code: "SE", dial: "46", name: "Sweden" },
  { code: "NO", dial: "47", name: "Norway" },
  { code: "ZA", dial: "27", name: "South Africa" },
  { code: "NG", dial: "234", name: "Nigeria" },
  { code: "KE", dial: "254", name: "Kenya" },
  { code: "AE", dial: "971", name: "UAE" },
  { code: "SA", dial: "966", name: "Saudi Arabia" },
  { code: "SG", dial: "65", name: "Singapore" },
  { code: "MY", dial: "60", name: "Malaysia" },
  { code: "NZ", dial: "64", name: "New Zealand" },
  { code: "IE", dial: "353", name: "Ireland" },
  { code: "PT", dial: "351", name: "Portugal" },
]

/** Guess country code from browser locale (e.g. en-US -> US) */
export function getDefaultCountryCode(): string {
  if (typeof navigator === "undefined") return "US"
  const lang = navigator.language || (navigator as { languages?: string[] }).languages?.[0] || "en-US"
  const parts = lang.split("-")
  if (parts.length > 1) {
    const code = parts[1]!.toUpperCase()
    if (COUNTRY_DIAL_CODES.some((c) => c.code === code)) return code
  }
  return "US"
}

/** Format phone to E.164: +{dial}{digits} */
export function toE164(dialCode: string, digits: string): string {
  const clean = digits.replace(/\D/g, "")
  if (!clean) return ""
  return `+${dialCode}${clean}`
}
