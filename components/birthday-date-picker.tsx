"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface BirthdayDatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function BirthdayDatePicker({
  value,
  onChange,
  placeholder = "Pick your birthday",
  className,
  disabled,
}: BirthdayDatePickerProps) {
  const [open, setOpen] = useState(false)
  const date = value ? new Date(value + "T12:00:00") : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "border-input placeholder:text-muted-foreground flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "border-white/30 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/30",
            !date && "text-white/70",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-white/70" />
          {date ? format(date, "MMMM d, yyyy") : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, "yyyy-MM-dd"))
              setOpen(false)
            }
          }}
          defaultMonth={date ?? new Date(1990, 0, 1)}
          fromYear={1900}
          toYear={new Date().getFullYear()}
          captionLayout="dropdown"
          classNames={{
            root: "bg-popover text-popover-foreground",
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
