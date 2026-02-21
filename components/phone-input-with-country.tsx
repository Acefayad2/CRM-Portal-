"use client"

import { useState } from "react"
import {
  COUNTRY_DIAL_CODES,
  getDefaultCountryCode,
  toE164,
} from "@/lib/countries"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface PhoneInputWithCountryProps {
  value?: string
  onChange: (e164: string) => void
  placeholder?: string
  className?: string
  required?: boolean
}

/** Parse E.164 like +12135551234 to { code, digits } */
function parseE164(e164: string): { code: string; digits: string } | null {
  if (!e164?.startsWith("+")) return null
  const rest = e164.slice(1)
  for (let len = 1; len <= 4; len++) {
    const dial = rest.slice(0, len)
    const country = COUNTRY_DIAL_CODES.find((c) => c.dial === dial)
    if (country) {
      return { code: country.code, digits: rest.slice(len).replace(/\D/g, "") }
    }
  }
  return null
}

export function PhoneInputWithCountry({
  value = "",
  onChange,
  placeholder = "Phone number",
  className,
  required,
}: PhoneInputWithCountryProps) {
  const [countryCode, setCountryCode] = useState<string>(() => {
    const parsed = parseE164(value)
    return parsed?.code ?? getDefaultCountryCode()
  })
  const [digits, setDigits] = useState(() => {
    const parsed = parseE164(value)
    return parsed?.digits ?? value.replace(/\D/g, "")
  })

  const country = COUNTRY_DIAL_CODES.find((c) => c.code === countryCode)
  const dial = country?.dial ?? "1"

  const report = (d: string, dig: string) => onChange(toE164(d, dig))

  const handleCountryChange = (code: string) => {
    setCountryCode(code)
    const c = COUNTRY_DIAL_CODES.find((x) => x.code === code)
    report(c?.dial ?? "1", digits)
  }

  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "")
    setDigits(v)
    report(dial, v)
  }

  const inputCn =
    "border-white/30 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30"

  return (
    <div
      className={cn(
        "border-input flex h-9 w-full overflow-hidden rounded-md border bg-transparent shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50",
        "border-white/30 bg-white/10 focus-within:border-white/50 focus-within:ring-white/30",
        className
      )}
    >
      <Select value={countryCode} onValueChange={handleCountryChange}>
        <SelectTrigger
          className={cn(
            "h-full w-auto min-w-0 border-0 bg-transparent shadow-none focus:ring-0",
            inputCn,
            "rounded-r-none border-r border-white/20 pr-2"
          )}
        >
          <SelectValue>
            <span className="text-white">+{dial}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_DIAL_CODES.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <span className="text-foreground">
                {c.name} (+{c.dial})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        inputMode="numeric"
        placeholder={placeholder}
        value={digits}
        onChange={handleDigitsChange}
        required={required}
        className={cn(
          "h-full flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0",
          inputCn,
          "rounded-l-none border-l-0 pl-2"
        )}
      />
    </div>
  )
}
