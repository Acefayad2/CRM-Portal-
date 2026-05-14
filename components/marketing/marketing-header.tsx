"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/logo"
import { COMPANY_DISPLAY_NAME } from "@/lib/site"
import { cn } from "@/lib/utils"

/** In-page sections on the marketing home */
const productLinks = [
  { href: "/#platform", label: "Platform" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#customers", label: "Use cases" },
  { href: "/#trust", label: "Trust" },
  { href: "/#about", label: "About" },
  { href: "/#faq", label: "FAQ" },
] as const

const navLinkClass =
  "shrink-0 whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"

const desktopMenuTriggerClass = cn(
  navLinkClass,
  "inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 outline-none",
  "hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "data-[state=open]:text-foreground",
)

function DesktopNavDropdown({
  label,
  items,
}: {
  label: string
  items: readonly { readonly href: string; readonly label: string }[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={desktopMenuTriggerClass}>
        {label}
        <ChevronDown className="size-4 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-[10.5rem]">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href} className="cursor-pointer">
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MarketingHeader({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6",
          "lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-4",
        )}
      >
        <div className="min-w-0 shrink-0 lg:justify-self-start">
          <Link
            href="/"
            className="inline-flex max-w-full items-center gap-3 rounded-full bg-black px-3 py-2 sm:px-4"
          >
            <Logo className="h-5 w-[96px] shrink-0" />
            <span className="hidden text-xs uppercase tracking-[0.2em] text-white/70 md:inline">
              {COMPANY_DISPLAY_NAME}
            </span>
          </Link>
        </div>

        <nav
          className="hidden flex-nowrap items-center gap-x-2 lg:flex lg:justify-self-center lg:gap-x-3 xl:gap-x-4"
          aria-label="Primary"
        >
          <DesktopNavDropdown label="Product" items={productLinks} />
          <Link href="/pricing" className={navLinkClass}>
            Pricing
          </Link>
          <Link href="/contact" className={navLinkClass}>
            Contact
          </Link>
          <Link href="/support" className={navLinkClass}>
            Support
          </Link>
          <Link href="/sms-policy" className={navLinkClass}>
            SMS policy
          </Link>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:justify-self-end">
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
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile primary">
            <Collapsible defaultOpen={false} className="group">
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted">
                Product
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden">
                <div className="flex flex-col gap-0.5 pb-1 pl-1 pt-0.5">
                  {productLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Link
              href="/pricing"
              className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/support"
              className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Support
            </Link>
            <Link
              href="/sms-policy"
              className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              SMS policy
            </Link>

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
