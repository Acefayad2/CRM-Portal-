"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { COMPANY_DISPLAY_NAME } from "@/lib/site"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/#platform", label: "Platform" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#customers", label: "Use cases" },
  { href: "/#trust", label: "Trust" },
  { href: "/#about", label: "About" },
  { href: "/#faq", label: "FAQ" },
  { href: "/pricing", label: "Pricing" },
  { href: "/sms-policy", label: "SMS policy" },
  { href: "/contact", label: "Contact" },
  { href: "/support", label: "Support" },
] as const

export function MarketingHeader({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 rounded-full bg-black px-3 py-2 sm:px-4">
          <Logo className="h-5 w-[96px]" />
          <span className="hidden text-xs uppercase tracking-[0.2em] text-white/70 md:inline">
            {COMPANY_DISPLAY_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              Get started
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
            <Link href="/signup" className="px-3 pt-2" onClick={() => setOpen(false)}>
              <Button className="w-full rounded-full bg-foreground text-background">Get started</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
