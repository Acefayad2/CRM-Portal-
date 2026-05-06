import Link from "next/link"
import { cn } from "@/lib/utils"

const links = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/policy/twilio", label: "SMS & Twilio" },
] as const

export type SiteLegalFooterVariant = "portal" | "marketing" | "legal" | "auth"

const linkClass: Record<SiteLegalFooterVariant, string> = {
  portal: "text-slate-500 hover:text-slate-200",
  marketing: "text-foreground/60 hover:text-foreground",
  legal:
    "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
  auth: "text-white/65 hover:text-white",
}

export function SiteLegalFooter({
  variant = "legal",
  className,
}: {
  variant?: SiteLegalFooterVariant
  className?: string
}) {
  return (
    <footer
      className={cn(
        "flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-1",
        className,
      )}
      role="contentinfo"
    >
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn("text-center text-sm underline-offset-4 hover:underline", linkClass[variant])}
        >
          {label}
        </Link>
      ))}
    </footer>
  )
}
