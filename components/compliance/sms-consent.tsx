"use client"

import * as React from "react"
import Link from "next/link"
import { COMPANY_DISPLAY_NAME, SITE_ORIGIN, smsProgram } from "@/lib/site"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/** Full TCPA-style opt-in paragraph beside phone collection (account holder agrees to receive from Pantheon Portal). */
export const SMS_ACCOUNT_OPT_IN_PARAGRAPH =
  `By providing your phone number, you agree to receive SMS messages from ${COMPANY_DISPLAY_NAME} regarding appointments, onboarding updates, account notifications, follow-ups, and platform updates. Message and data rates may apply. Reply STOP to unsubscribe or HELP for help.`

export function SmsOptInParagraph({
  className,
  mutedClassName,
  variant = "default",
}: {
  className?: string
  /** Text color classes for dark-on-light UIs */
  mutedClassName?: string
  variant?: "default" | "auth"
}) {
  const linkClass =
    variant === "auth"
      ? "font-medium text-white/90 underline underline-offset-2 hover:text-white"
      : "font-medium underline underline-offset-2 hover:text-foreground"
  return (
    <p
      className={cn(
        "text-xs leading-relaxed",
        variant === "auth" ? "text-white/70" : (mutedClassName ?? "text-muted-foreground"),
        className,
      )}
      role="note"
    >
      {SMS_ACCOUNT_OPT_IN_PARAGRAPH}{" "}
      <Link href="/privacy-policy" className={linkClass}>
        Privacy Policy
      </Link>
      {" · "}
      <Link href="/terms" className={linkClass}>
        Terms
      </Link>
    </p>
  )
}

const checkboxLabel = `I agree to receive SMS communications from ${COMPANY_DISPLAY_NAME}.`

export function SmsConsentCheckboxRow({
  id = "sms-consent",
  checked,
  onCheckedChange,
  disabled,
  labelClassName,
  className,
  variant = "default",
}: {
  id?: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
  disabled?: boolean
  labelClassName?: string
  className?: string
  variant?: "default" | "auth" | "dialog"
}) {
  const labelTone =
    variant === "auth"
      ? "text-white/90"
      : variant === "dialog"
        ? "text-foreground"
        : "text-foreground"

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        disabled={disabled}
        className={cn(variant === "auth" && "border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-slate-900")}
      />
      <Label htmlFor={id} className={cn("cursor-pointer text-sm font-normal leading-snug", labelTone, labelClassName)}>
        {checkboxLabel}
      </Label>
    </div>
  )
}

/** Short disclosure for primary CTAs (no checkbox). */
export function SmsCtaMicrocopy({
  className,
  variant = "marketing",
}: {
  className?: string
  variant?: "marketing" | "dark"
}) {
  const linkClass =
    variant === "dark"
      ? "font-medium text-white/90 underline underline-offset-2 hover:text-white"
      : "font-medium underline underline-offset-2 hover:text-foreground"
  return (
    <p
      className={cn(
        "max-w-xl text-center text-[11px] leading-relaxed sm:text-xs",
        variant === "dark" ? "text-white/55" : "text-muted-foreground",
        className,
      )}
    >
      {smsProgram.shortCarrierLine} See{" "}
      <Link href="/sms-policy" className={linkClass}>
        SMS policy
      </Link>
      ,{" "}
      <Link href="/terms" className={linkClass}>
        Terms
      </Link>
      , and{" "}
      <Link href="/privacy-policy" className={linkClass}>
        Privacy Policy
      </Link>
      . Sent by {COMPANY_DISPLAY_NAME} ({SITE_ORIGIN.replace(/^https:\/\//, "")}).
    </p>
  )
}

/** When an admin sends an SMS to someone else’s number — attestation only (not “receive from Pantheon” checkbox). */
export function SmsOutboundInviteAttestation({
  id,
  checked,
  onCheckedChange,
  disabled,
  variant = "dark",
}: {
  id: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
  disabled?: boolean
  variant?: "dark" | "light"
}) {
  const label =
    `I confirm this recipient has agreed to receive this SMS from ${COMPANY_DISPLAY_NAME} (including join or verification messages) and that I am authorized to send it in compliance with applicable law.`

  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        disabled={disabled}
        className={cn(
          variant === "dark" && "border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-slate-900",
        )}
      />
      <Label
        htmlFor={id}
        className={cn(
          "cursor-pointer text-xs font-normal leading-relaxed",
          variant === "dark" ? "text-white/80" : "text-muted-foreground",
        )}
      >
        {label}
      </Label>
    </div>
  )
}

/** Storing a client phone for CRM / outbound messaging — business user attestation. */
export function SmsClientRecordAttestation({
  id,
  checked,
  onCheckedChange,
  disabled,
}: {
  id: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} disabled={disabled} />
      <Label htmlFor={id} className="cursor-pointer text-xs font-normal leading-relaxed text-muted-foreground">
        I confirm I have appropriate consent to contact this number using {COMPANY_DISPLAY_NAME} for client communications
        in compliance with applicable law (including TCPA and industry rules).
      </Label>
    </div>
  )
}
