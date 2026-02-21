"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  min?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
  min,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const date = value ? new Date(value + "T12:00:00") : undefined
  const minDate = min ? new Date(min + "T12:00:00") : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:opacity-50 md:text-sm",
            "border-white/30 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-blue-500",
            !date && "text-white/70",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-white/70" />
          {date ? format(date, "MMM d, yyyy") : placeholder}
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
          disabled={minDate ? (d) => d < minDate : undefined}
          defaultMonth={date ?? minDate ?? new Date()}
          fromDate={minDate}
          classNames={{
            root: "bg-popover text-popover-foreground",
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
